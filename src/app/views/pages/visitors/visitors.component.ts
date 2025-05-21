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
  updatingVisitor: boolean = false;
  updatingVisitorId: string | null = null;
  
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
    id: 'visitor-pagination',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };
  
  private filterSubject = new Subject<void>();
  
  constructor(
    private visitorService: VisitorService,
    private chapterService: ChapterService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    // Debounce filter changes to prevent too many API calls
    this.filterSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
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
      // Prepare request params
      const requestParams = {
        page: this.filters.page,
        limit: this.filters.limit,
        chapter_name: this.filters.chapterName || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined
      };
      
      const response = await this.visitorService.getAllVisitors(requestParams);
      this.visitors = response;
      
      // Update pagination config
      this.paginationConfig.currentPage = this.visitors.page;
      this.paginationConfig.totalItems = this.visitors.totalDocs;
      this.paginationConfig.itemsPerPage = this.visitors.limit;
      
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
    this.fetchVisitors();
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
    this.fetchVisitors();
  }

  // Helper method to format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }

  // Helper method to format date for input fields
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // New method to toggle visitor paid status
  async toggleVisitorPaidStatus(visitor: Visitor): Promise<void> {
    // Set updating state for this specific visitor
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

  // Export methods
  async exportToExcel(): Promise<void> {
    try {
      this.exporting = true;
      
      // Prepare data for export - get all visitors based on current filters
      const exportParams = {
        chapter_name: this.filters.chapterName || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined,
        limit: 10000, // Use a large limit to get all data
        page: 1
      };
      
      // Get all data for export
      const allData = await this.visitorService.getAllVisitors(exportParams);
      
      // Transform data for Excel export
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
          'Fees': visitor.fees || 'N/A'
        };
      });
      
      // Generate filename with current date
      const fileName = `Visitors_Report_${this.formatDateForFileName(new Date())}`;
      
      // Call export service
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
      
      // Prepare data for export - get all visitors based on current filters
      const exportParams = {
        chapter_name: this.filters.chapterName || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined,
        limit: 10000, // Use a large limit to get all data
        page: 1
      };
      
      // Get all data for export
      const allData = await this.visitorService.getAllVisitors(exportParams);
      
      // Generate filename with current date
      const fileName = `Visitors_Report_${this.formatDateForFileName(new Date())}`;
      
      // Define columns and data for PDF
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
        { header: 'Visitor Type', dataKey: 'visitorType' }
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
          visitorType: visitor.paid ? 'Paid' : 'Unpaid'
        };
      });
      
      // Define PDF document title and subtitle
      const title = 'Visitors Report';
      let subtitle = 'All Visitors';
      
      if (this.filters.chapterName) {
        subtitle = `Chapter: ${this.filters.chapterName}`;
      }
      
      if (this.filters.startDate && this.filters.endDate) {
        subtitle += ` | Period: ${this.formatDate(this.filters.startDate)} to ${this.formatDate(this.filters.endDate)}`;
      }
      
      // Call export service
      await this.exportService.exportToPDF(columns, data, title, subtitle, fileName);
      swalHelper.showToast('PDF file downloaded successfully', 'success');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      swalHelper.showToast('Failed to export to PDF', 'error');
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