import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceReportService, AttendanceReportResponse } from '../../../services/auth.service';
import { ChapterService, Chapter } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExportService } from '../../../services/export.service';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [AttendanceReportService, ChapterService, ExportService],
  templateUrl: './attendence-Report.component.html',
  styleUrls: ['./attendence-Report.component.css'],
})
export class AttendanceReportComponent implements OnInit {
  attendanceRecords: AttendanceReportResponse = {
    docs: [],
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null
  };
  
  chapters: Chapter[] = [];
  eventTypes: string[] = ['event', 'meeting'];
  loading: boolean = false;
  chaptersLoading: boolean = false;
  exporting: boolean = false;
  
  Math = Math;
  
  filters = {
    page: 1,
    limit: 10,
    chapterName: '',
    event_type: '',
    startDate: this.formatDateForInput(new Date(new Date().setDate(new Date().getDate() - 30))),
    endDate: this.formatDateForInput(new Date())
  };
  
  paginationConfig = {
    id: 'attendance-pagination'
  };
  
  private filterSubject = new Subject<void>();
  
  constructor(
    private attendanceService: AttendanceReportService,
    private chapterService: ChapterService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchAttendanceRecords();
    });
  }

  ngOnInit(): void {
    this.fetchChapters();
    this.fetchAttendanceRecords();
  }

  async fetchAttendanceRecords(): Promise<void> {
    this.loading = true;
    try {
      const requestParams = {
        page: this.filters.page,
        limit: this.filters.limit,
        chapterName: this.filters.chapterName || undefined,
        event_type: this.filters.event_type || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined
      };
      const response = await this.attendanceService.getAllAttendance(requestParams);
      this.attendanceRecords = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      swalHelper.showToast('Failed to fetch attendance records', 'error');
    } finally {
      this.loading = false;
    }
  }

  async fetchChapters(): Promise<void> {
    this.chaptersLoading = true;
    try {
      const response = await this.chapterService.getAllChapters({
        page: 1,
        limit: 1000,
        search: ''
      });
      this.chapters = response.docs;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      swalHelper.showToast('Failed to fetch chapters', 'error');
    } finally {
      this.chaptersLoading = false;
    }
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.filterSubject.next();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.fetchAttendanceRecords();
  }

  resetFilters(): void {
    this.filters = {
      page: 1,
      limit: 10,
      chapterName: '',
      event_type: '',
      startDate: this.formatDateForInput(new Date(new Date().setDate(new Date().getDate() - 30))),
      endDate: this.formatDateForInput(new Date())
    };
    this.fetchAttendanceRecords();
  }

  getProfilePicUrl(picPath: string | undefined): string {
    if (!picPath) return 'assets/images/default-avatar.png';
    return `${environment.imageUrl}/${picPath}`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async exportToExcel(): Promise<void> {
    try {
      this.exporting = true;
      const exportParams = {
        chapterName: this.filters.chapterName || undefined,
        event_type: this.filters.event_type || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined,
        limit: 10000,
        page: 1
      };
      const allData = await this.attendanceService.getAllAttendance(exportParams);
      const exportData = allData.docs.map((record, index) => {
        return {
          'Sr No': index + 1,
          'Member Name': record.userData?.name || 'Unknown',
          'Chapter Name': record.userData?.chapter_name || 'N/A',
          'Event Type': record.eventData?.event_or_meeting === 'event' ? 'Event' : 'Meeting',
          'Event Name': record.eventData?.name || 'N/A',
          'Event Date': this.formatDate(record.eventData?.date),
          'Attendance Status': 'Present'
        };
      });
      const fileName = `Attendance_Report_${this.formatDateForFileName(new Date())}`;
      await this.exportService.exportToExcel(exportData, fileName);
      swalHelper.showToast('Excel file downloaded successfully', 'success');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      swalHelper.showToast('Failed to export to Excel', 'error');
    } finally {
      this.exporting = false;
    }
  }

  async exportToPDF(): Promise<void> {
    try {
      this.exporting = true;
      const exportParams = {
        chapterName: this.filters.chapterName || undefined,
        event_type: this.filters.event_type || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined,
        limit: 10000,
        page: 1
      };
      const allData = await this.attendanceService.getAllAttendance(exportParams);
      const fileName = `Attendance_Report_${this.formatDateForFileName(new Date())}`;
      const columns = [
        { header: 'Sr No', dataKey: 'srNo' },
        { header: 'Member Name', dataKey: 'memberName' },
        { header: 'Chapter Name', dataKey: 'chapterName' },
        { header: 'Event Type', dataKey: 'eventType' },
        { header: 'Event Name', dataKey: 'eventName' },
        { header: 'Event Date', dataKey: 'eventDate' },
        { header: 'Status', dataKey: 'status' }
      ];
      const data = allData.docs.map((record, index) => {
        return {
          srNo: index + 1,
          memberName: record.userData?.name || 'Unknown',
          chapterName: record.userData?.chapter_name || 'N/A',
          eventType: record.eventData?.event_or_meeting === 'event' ? 'Event' : 'Meeting',
          eventName: record.eventData?.name || 'N/A',
          eventDate: this.formatDate(record.eventData?.date),
          status: 'Present'
        };
      });
      const title = 'Attendance Report';
      let subtitle = 'All Attendance Records';
      if (this.filters.chapterName) {
        subtitle = `Chapter: ${this.filters.chapterName}`;
      }
      if (this.filters.event_type) {
        subtitle += ` | Type: ${this.filters.event_type === 'event' ? 'Event' : 'Meeting'}`;
      }
      if (this.filters.startDate && this.filters.endDate) {
        subtitle += ` | Period: ${this.formatDate(this.filters.startDate)} to ${this.formatDate(this.filters.endDate)}`;
      }
      await this.exportService.exportToPDF(columns, data, title, subtitle, fileName);
      swalHelper.showToast('PDF file downloaded successfully', 'success');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      swalHelper.showToast('Failed to export to PDF', 'error');
    } finally {
      this.exporting = false;
    }
  }

  private formatDateForFileName(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}