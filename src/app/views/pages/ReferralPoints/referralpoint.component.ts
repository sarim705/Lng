import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { PointHistoryService, PointHistoryResponse } from '../../../services/auth.service';
import { ChapterService, Chapter } from '../../../services/auth.service';
import { AuthService } from '../../../services/auth.service';
import { ExportService } from '../../../services/export.service';
import { environment } from 'src/env/env.local';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-point-history',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [PointHistoryService, ChapterService, AuthService, ExportService],
  templateUrl: './referralpoint.component.html',
  styleUrls: ['./referralpoint.component.css']
})
export class PointHistoryComponent implements OnInit {
  points: PointHistoryResponse = {
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
  users: any[] = [];
  months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 }
  ];
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  loading: boolean = false;
  chaptersLoading: boolean = false;
  usersLoading: boolean = false;
  exporting: boolean = false;

  Math = Math;

  filters = {
    page: 1,
    limit: 10,
    chapter: '',
    userId: '',
    month: null as number | null,
    year: new Date().getFullYear()
  };

  paginationConfig = {
    id: 'point-history-pagination',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  userSearchSubject = new Subject<string>();
  private filterSubject = new Subject<void>();

  constructor(
    private pointHistoryService: PointHistoryService,
    private chapterService: ChapterService,
    private authService: AuthService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchPoints();
    });

    this.userSearchSubject.pipe(debounceTime(500)).subscribe(searchTerm => {
      this.fetchUsers(searchTerm);
    });
  }

  ngOnInit(): void {
    this.fetchChapters();
    this.fetchUsers('');
    this.fetchPoints();
  }

  async fetchPoints(): Promise<void> {
    this.loading = true;
    try {
      const requestParams = {
        page: this.filters.page,
        limit: this.filters.limit,
        chapter: this.filters.chapter || undefined,
        userId: this.filters.userId || undefined,
        month: this.filters.month || undefined,
        year: this.filters.year || undefined
      };

      const response = await this.pointHistoryService.getPointHistory(requestParams);
      this.points = response;

      this.paginationConfig.currentPage = this.points.page;
      this.paginationConfig.totalItems = this.points.totalDocs;
      this.paginationConfig.itemsPerPage = this.points.limit;

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching point history:', error);
      swalHelper.showToast('Failed to fetch point history', 'error');
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

  async fetchUsers(search: string): Promise<void> {
    this.usersLoading = true;
    try {
      const response = await this.authService.getUsers({
        page: 1,
        limit: 100,
        search
      });
      this.users = response.data?.docs || response.docs || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      swalHelper.showToast('Failed to fetch users', 'error');
    } finally {
      this.usersLoading = false;
    }
  }

  onUserSearch(event: { term: string }): void {
    this.userSearchSubject.next(event.term);
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.paginationConfig.currentPage = 1;
    this.filterSubject.next();
  }

  resetFilters(): void {
    this.filters = {
      page: 1,
      limit: 10,
      chapter: '',
      userId: '',
      month: null,
      year: new Date().getFullYear()
    };
    this.paginationConfig.currentPage = 1;
    this.fetchPoints();
  }

  getProfilePicUrl(picPath: string): string {
    if (!picPath) return 'assets/images/default-avatar.png';
    return `${environment.imageUrl}/${picPath}`;
  }

  async exportToExcel(): Promise<void> {
    try {
      this.exporting = true;
      const exportParams = {
        chapter: this.filters.chapter || undefined,
        userId: this.filters.userId || undefined,
        month: this.filters.month || undefined,
        year: this.filters.year || undefined,
        limit: 10000,
        page: 1
      };

      const allData = await this.pointHistoryService.getPointHistory(exportParams);

      const exportData = allData.docs.map((point, index) => {
        return {
          'Sr No': index + 1,
          'Name': point.name || 'Unknown',
          'Chapter': point.chapter_name || 'N/A',
          'Attendance Regular Point': point.leaderboardPoints?.attendance_regular || 0,
          'Induction': point.leaderboardPoints?.induction || 0,
          'Referral Point': point.leaderboardPoints?.referal || 0,
          'One to One Point': point.leaderboardPoints?.one_to_one || 0,
          'TYFCB Point': point.leaderboardPoints?.tyfcb || 0,
          'Events Attendance Point': point.leaderboardPoints?.event_attendance || 0,
          'Visitor Point': point.leaderboardPoints?.visitor || 0,
          'Total Point': point.totalPointsSum || 0
        };
      });

      const fileName = `Point_History_${this.formatDateForFileName(new Date())}`;
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
        chapter: this.filters.chapter || undefined,
        userId: this.filters.userId || undefined,
        month: this.filters.month || undefined,
        year: this.filters.year || undefined,
        limit: 10000,
        page: 1
      };

      const allData = await this.pointHistoryService.getPointHistory(exportParams);

      const fileName = `Point_History_${this.formatDateForFileName(new Date())}`;
      const columns = [
        { header: 'Sr No', dataKey: 'srNo' },
        { header: 'Name', dataKey: 'name' },
        { header: 'Attendance Regular', dataKey: 'attendanceRegular' },
        { header: 'Induction', dataKey: 'induction' },
        { header: 'Referral', dataKey: 'referral' },
        { header: 'One to One', dataKey: 'oneToOne' },
        { header: 'TYFCB', dataKey: 'tyfcb' },
        { header: 'Events Attendance', dataKey: 'eventAttendance' },
        { header: 'Visitor', dataKey: 'visitor' },
        { header: 'Total Point', dataKey: 'totalPoint' }
      ];

      const data = allData.docs.map((point, index) => {
        return {
          srNo: index + 1,
          name: `${point.name || 'Unknown'}\n(${point.chapter_name || 'N/A'})`,
          attendanceRegular: point.leaderboardPoints?.attendance_regular || 0,
          induction: point.leaderboardPoints?.induction || 0,
          referral: point.leaderboardPoints?.referal || 0,
          oneToOne: point.leaderboardPoints?.one_to_one || 0,
          tyfcb: point.leaderboardPoints?.tyfcb || 0,
          eventAttendance: point.leaderboardPoints?.event_attendance || 0,
          visitor: point.leaderboardPoints?.visitor || 0,
          totalPoint: point.totalPointsSum || 0
        };
      });

      const title = 'Point History Report';
      let subtitle = 'All Point Records';
      if (this.filters.chapter) {
        subtitle = `Chapter: ${this.filters.chapter}`;
      }
      if (this.filters.userId) {
        const user = this.users.find(u => u._id === this.filters.userId);
        subtitle += ` | User: ${user?.name || 'Unknown'}`;
      }
      if (this.filters.month && this.filters.year) {
        const monthName = this.months.find(m => m.value === this.filters.month)?.name;
        subtitle += ` | Period: ${monthName} ${this.filters.year}`;
      } else if (this.filters.year) {
        subtitle += ` | Year: ${this.filters.year}`;
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

  onPageChange(page: number): void {
    this.filters.page = page;
    this.paginationConfig.currentPage = page;
    this.fetchPoints();
  }
}