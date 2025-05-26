import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReferralServiceRecieved , Referral, ReferralResponse } from '../../../services/auth.service';
import { ChapterService, Chapter } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [ReferralServiceRecieved, ChapterService, ExportService],
  templateUrl: './referralReportRecieved.component.html',
  styleUrls: ['./referralReportRecieved.component.css'],
})
export class ReferralsComponentRecieved implements OnInit {
  referrals: ReferralResponse = {
    docs: [],
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 0,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null
  };
  
  chapters: Chapter[] = [];
  loading: boolean = false;
  chaptersLoading: boolean = false;
  exporting: boolean = false;
  
  // Add Math object for use in template
  Math = Math;
  
  filters = {
    page: 1,
    limit: 10,
    chapterName: '',
    startDate: this.formatDateForInput(new Date(new Date().setDate(new Date().getDate() - 30))), // Default to last 30 days
    endDate: this.formatDateForInput(new Date())
  };
  
  // Pagination configuration
  paginationConfig = {
    id: 'referral-pagination',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };
  
  private filterSubject = new Subject<void>();
  
  constructor(
    private referralService: ReferralServiceRecieved,
    private chapterService: ChapterService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    // Debounce filter changes to prevent too many API calls
    this.filterSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.fetchReferrals();
    });
  }

  ngOnInit(): void {
    this.fetchChapters();
    this.fetchReferrals();
  }

  async fetchReferrals(): Promise<void> {
    this.loading = true;
    try {
      const requestParams: any = {
        page: this.filters.page,
        limit: this.filters.limit
      };
      if (this.filters.chapterName) requestParams.chapterName = this.filters.chapterName;
      if (this.filters.startDate) requestParams.startDate = this.filters.startDate;
      if (this.filters.endDate) requestParams.endDate = this.filters.endDate;
  
      const response = await this.referralService.getAllReferrals(requestParams);
      console.log('API Response:', response);
      this.referrals = response;
      this.paginationConfig.currentPage = this.referrals.page;
      this.paginationConfig.totalItems = this.referrals.totalDocs;
      this.paginationConfig.itemsPerPage = this.referrals.limit;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching referrals:', error);
      swalHelper.showToast('Failed to fetch referrals', 'error');
    } finally {
      this.loading = false;
    }
  }

  async fetchChapters(): Promise<void> {
    this.chaptersLoading = true;
    
    try {
      const response = await this.chapterService.getAllChapters({
        page: 1,
        limit: 1000, // Get all chapters for dropdown
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
    this.filters.page = 1; // Reset to first page when filters change
    this.paginationConfig.currentPage = 1; // Also reset pagination config
    this.filterSubject.next();
  }

  onPageChange(page: number): void {
    // Set both page values to ensure consistency
    this.filters.page = page;
    this.paginationConfig.currentPage = page;
    this.fetchReferrals();
  }

  resetFilters(): void {
    this.filters = {
      page: 1,
      limit: 10,
      chapterName: '',
      startDate: this.formatDateForInput(new Date(new Date().setDate(new Date().getDate() - 30))),
      endDate: this.formatDateForInput(new Date())
    };
    // Reset pagination config as well
    this.paginationConfig.currentPage = 1;
    this.fetchReferrals();
  }

  // Helper method to format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Helper method to format date for input fields
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Export methods
  async exportToExcel(): Promise<void> {
    try {
      this.exporting = true;
  
      const exportParams: any = {
        page: 1,
        limit: 10000
      };
      if (this.filters.chapterName) exportParams.chapterName = this.filters.chapterName;
      if (this.filters.startDate) exportParams.startDate = this.filters.startDate;
      if (this.filters.endDate) exportParams.endDate = this.filters.endDate;
  
      const allData = await this.referralService.getAllReferrals(exportParams);
  
      // Check if data is empty
      if (!allData.docs || allData.docs.length === 0) {
        swalHelper.showToast('No referrals found for the selected filters', 'warning');
        return;
      }
  
      const exportData = allData.docs.map((referral, index) => {
        return {
          'Sr No': index + 1,
          'Referral From': referral.giver_id?.name || 'Unknown',
          'From Chapter': referral.giver_id?.chapter_name || 'N/A',
          'Referral To': referral.receiver_id?.name || 'External Referral',
          'To Chapter': referral.receiver_id?.chapter_name || 'N/A',
          'Referral Type': referral.referral_type === 'inside' ? 'Inside' : 'Outside',
          'Referral': referral.referral,
          'Mobile No': referral.mobile_number,
          'Comments': referral.comments || 'No comments',
         
          'Date': this.formatDate(referral.createdAt)
        };
      });
  
      const fileName = `Referrals_Report_${this.formatDateForFileName(new Date())}`;
      await this.exportService.exportToExcel(exportData, fileName);
      swalHelper.showToast('Excel file downloaded successfully', 'success');
    } catch (error: any) {
      console.error('Error exporting to Excel:', {
        message: error.message,
        stack: error.stack,
        response: error.response || 'No response data'
      });
      swalHelper.showToast(`Failed to export to Excel: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      this.exporting = false;
    }
  }
  async exportToPDF(): Promise<void> {
    try {
      this.exporting = true;
  
      // Prepare export parameters
      const exportParams: any = {
        page: 1,
        limit: 10000
      };
      if (this.filters.chapterName) exportParams.chapterName = this.filters.chapterName;
      if (this.filters.startDate) exportParams.startDate = this.filters.startDate;
      if (this.filters.endDate) exportParams.endDate = this.filters.endDate;
  
      // Get all data for export
      const allData = await this.referralService.getAllReferrals(exportParams);
  
      // Check if data is empty
      if (!allData.docs || allData.docs.length === 0) {
        swalHelper.showToast('No referrals found for the selected filters', 'warning');
        return;
      }
  
      // Generate filename with current date
      const fileName = `Referrals_Report_${this.formatDateForFileName(new Date())}`;
  
      // Define columns and data for PDF
      const columns = [
        { header: 'Sr No', dataKey: 'srNo' },
        { header: 'Referral From', dataKey: 'fromName' },
        { header: 'Referral To', dataKey: 'toName' },
        { header: 'Type', dataKey: 'type' },
        { header: 'Referral', dataKey: 'referral' },
        { header: 'Mobile', dataKey: 'mobile' },
     
        { header: 'Date', dataKey: 'date' }
      ];
  
      const data = allData.docs.map((referral, index) => {
        return {
          srNo: index + 1,
          fromName: `${referral.giver_id?.name || 'Unknown'}\n(${referral.giver_id?.chapter_name || 'N/A'})`,
          toName: referral.receiver_id
            ? `${referral.receiver_id?.name || 'Unknown'}\n(${referral.receiver_id?.chapter_name || 'N/A'})`
            : 'External Referral',
          type: referral.referral_type === 'inside' ? 'Inside' : 'Outside',
          referral: referral.referral,
          mobile: referral.mobile_number,
          rating: '★'.repeat(referral.rating) + '☆'.repeat(5 - referral.rating),
          date: this.formatDate(referral.createdAt)
        };
      });
  
      // Define PDF document title and subtitle
      const title = 'Referrals Report';
      let subtitle = 'All Referrals';
      if (this.filters.chapterName) {
        subtitle = `Chapter: ${this.filters.chapterName}`;
      }
      if (this.filters.startDate && this.filters.endDate) {
        subtitle += ` | Period: ${this.formatDate(this.filters.startDate)} to ${this.formatDate(this.filters.endDate)}`;
      }
  
      // Call export service
      await this.exportService.exportToPDF(columns, data, title, subtitle, fileName);
      swalHelper.showToast('PDF file downloaded successfully', 'success');
    } catch (error: any) {
      console.error('Error exporting to PDF:', {
        message: error.message,
        stack: error.stack,
        response: error.response || 'No response data'
      });
      swalHelper.showToast(`Failed to export to PDF: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      this.exporting = false;
    }
  }
  // Helper for file names
  private formatDateForFileName(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
}