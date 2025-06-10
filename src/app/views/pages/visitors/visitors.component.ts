// visitors.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService, Visitor, VisitorResponse } from '../../../services/auth.service';
import { ChapterService, Chapter } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExportService } from '../../../services/export.service';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-visitors',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [VisitorService, ChapterService, ExportService],
  templateUrl: './visitors.component.html',
  styleUrls: ['./visitors.component.css'],
})
export class VisitorsComponent implements OnInit {
  visitors: VisitorResponse = {
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
  loading: boolean = false;
  chaptersLoading: boolean = false;
  exporting: boolean = false;
  updatingVisitorId: string | null = null;
  toggling: { [key: string]: boolean } = {}; // Add toggling state for attendance
  
  Math = Math;
  
  filters = {
    page: 1,
    limit: 10,
    chapterName: null,
    startDate: this.formatDateForInput(new Date(new Date().setDate(new Date().getDate() - 30))),
    endDate: this.formatDateForInput(new Date())
  };
  
  paginationConfig = {
    id: 'visitor-pagination'
  };
  
  private filterSubject = new Subject<void>();
  
  constructor(
    private visitorService: VisitorService,
    private chapterService: ChapterService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchVisitors();
    });
  }

  ngOnInit(): void {
    this.fetchChapters();
    this.fetchVisitors();
  }

  async fetchVisitors(): Promise<void> {
    this.loading = true;
    try {
      const requestParams = {
        page: this.filters.page,
        limit: this.filters.limit,
        chapter_name: this.filters.chapterName || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined
      };
      const response = await this.visitorService.getAllVisitors(requestParams);
      console.log('Visitors response:', response);

      // Log each visitor object to debug missing fields
      response.docs.forEach((visitor, index) => {
        console.log(`Visitor ${index + 1}:`, {
          name: visitor.name,
          business_name: visitor.business_name,
          address: visitor.address,
          pincode: visitor.pincode,
          business_type: visitor.business_type,
          eventId: visitor.eventId,
          attendanceStatus: visitor.attendanceStatus // Log new field
        });
      });

      // Filter out invalid or empty visitor objects
      response.docs = response.docs.filter(visitor => 
        visitor && visitor._id && visitor.name
      );

      // Update totalDocs to reflect the filtered count
      response.totalDocs = response.docs.length;

      this.visitors = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching visitors:', error);
      swalHelper.showToast('Failed to fetch visitors', 'error');
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
      this.chapters = response.docs|| [];
      console.log('Chapters loaded:', this.chapters);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching chapters:', error);
      swalHelper.showToast('Failed to fetch chapters', 'error');
    } finally {
      this.chaptersLoading = false;
      this.cdr.detectChanges();
    }
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.fetchVisitors();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.fetchVisitors();
  }

  resetFilters(): void {
    this.filters = {
      page: 1,
      limit: 10,
      chapterName: null,
      startDate: this.formatDateForInput(new Date(new Date().setDate(new Date().getDate() - 30))),
      endDate: this.formatDateForInput(new Date())
    };
    this.fetchVisitors();
  }

  formatDate(dateString: string): string {
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

  async toggleVisitorPaidStatus(visitor: Visitor): Promise<void> {
    this.updatingVisitorId = visitor._id;
    try {
      const result = await this.visitorService.updateVisitor(visitor._id, { paid: !visitor.paid });
      if (result.success) {
        visitor.paid = !visitor.paid;
        swalHelper.showToast(`Visitor status changed to ${visitor.paid ? 'Paid' : 'Unpaid'}`, 'success');
      } else {
        swalHelper.showToast('Failed to update visitor status', 'error');
      }
    } catch (error) {
      console.error('Error updating visitor status:', error);
      swalHelper.showToast('Error updating visitor status', 'error');
    } finally {
      this.updatingVisitorId = null;
    }
  }

  async toggleVisitorAttendanceStatus(visitor: Visitor): Promise<void> {
    this.toggling[visitor._id] = true;
    try {
      const response = await this.visitorService.toggleVisitorAttendance({ visitorId: visitor._id });
      if (response.success) {
        visitor.attendanceStatus = response.data.visitor.attendanceStatus;
        swalHelper.showToast(`Visitor attendance status changed to ${visitor.attendanceStatus}`, 'success');
        this.cdr.detectChanges();
      } else {
        swalHelper.showToast('Failed to update attendance status', 'error');
      }
    } catch (error) {
      console.error('Error toggling attendance status:', error);
      swalHelper.showToast('Failed to toggle attendance status', 'error');
    } finally {
      this.toggling[visitor._id] = false;
      this.cdr.detectChanges();
    }
  }

  async exportToExcel(): Promise<void> {
    try {
      this.exporting = true;
      const exportParams = {
        chapter_name: this.filters.chapterName || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined,
        limit: 10000,
        page: 1
      };
      const allData = await this.visitorService.getAllVisitors(exportParams);
      const exportData = allData.docs.map((visitor, index) => {
        return {
          'Sr No': index + 1,
          'Title': visitor.eventId?.name || 'N/A',
          'Visitor Name': visitor.name || 'N/A',
          'Chapter': visitor.refUserId?.chapter_name || 'N/A',
          'Company Name': visitor.business_name || 'N/A',
          'Mobile No': visitor.mobile_number || 'N/A',
          'Email': visitor.email || 'N/A',
          'Visitor Address': visitor.address || 'N/A',
          'PinCode': visitor.pincode || 'N/A',
          'Visitor Date': visitor.eventId?.date ? this.formatDate(visitor.eventId.date) : 'N/A',
          'Profession': visitor.business_type || 'N/A',
          'Visitor Type': visitor.paid ? 'Paid' : 'Unpaid',
          'Attendance Status': visitor.attendanceStatus ? visitor.attendanceStatus : 'N/A', // Add attendanceStatus
          'Fees': visitor.fees || 'N/A'
        };
      });
      const fileName = `Visitors_Report_${this.formatDateForFileName(new Date())}`;
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
        chapter_name: this.filters.chapterName || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined,
        limit: 10000,
        page: 1
      };
      const allData = await this.visitorService.getAllVisitors(exportParams);
      const fileName = `Visitors_Report_${this.formatDateForFileName(new Date())}`;
      const columns = [
        { header: 'Sr No', dataKey: 'srNo' },
        { header: 'Title', dataKey: 'title' },
        { header: 'Visitor Name', dataKey: 'visitorName' },
        { header: 'Company Name', dataKey: 'companyName' },
        { header: 'Mobile No', dataKey: 'mobileNo' },
        { header: 'Address', dataKey: 'address' },
        { header: 'PinCode', dataKey: 'pincode' },
        { header: 'Visitor Date', dataKey: 'visitorDate' },
        { header: 'Profession', dataKey: 'profession' },
        { header: 'Visitor Type', dataKey: 'visitorType' },
        { header: 'Attendance Status', dataKey: 'attendanceStatus' } // Add attendanceStatus
      ];
      const data = allData.docs.map((visitor, index) => {
        return {
          srNo: index + 1,
          title: visitor.eventId?.name || 'N/A',
          visitorName: `${visitor.name || 'N/A'}\n(${visitor.refUserId?.chapter_name || 'N/A'})`,
          companyName: visitor.business_name || 'N/A',
          mobileNo: visitor.mobile_number || 'N/A',
          address: visitor.address || 'N/A',
          pincode: visitor.pincode || 'N/A',
          visitorDate: visitor.eventId?.date ? this.formatDate(visitor.eventId.date) : 'N/A',
          profession: visitor.business_type || 'N/A',
          visitorType: visitor.paid ? 'Paid' : 'Unpaid',
          attendanceStatus: visitor.attendanceStatus ? visitor.attendanceStatus : 'N/A' // Add attendanceStatus
        };
      });
      const title = 'Visitors Report';
      let subtitle = 'All Visitors';
      if (this.filters.chapterName) {
        subtitle = `Chapter: ${this.filters.chapterName}`;
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