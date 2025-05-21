import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestimonialService, Testimonial, TestimonialResponse } from '../../../services/auth.service';
import { ChapterService, Chapter } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExportService } from '../../../services/export.service';
import { environment } from 'src/env/env.local';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [TestimonialService, ChapterService, ExportService],
  templateUrl: './testimonialReport.component.html',
  styleUrls: ['./testimonialReport.component.css'],
})
export class TestimonialsComponent implements OnInit {
  testimonials: TestimonialResponse = {
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
    id: 'testimonial-pagination',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };
  
  private filterSubject = new Subject<void>();
  
  constructor(
    private testimonialService: TestimonialService,
    private chapterService: ChapterService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    // Debounce filter changes to prevent too many API calls
    this.filterSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.fetchTestimonials();
    });
  }

  ngOnInit(): void {
    this.fetchChapters();
    this.fetchTestimonials();
  }

  async fetchTestimonials(): Promise<void> {
    this.loading = true;
    
    try {
      // Prepare request params
      const requestParams = {
        page: this.filters.page,
        limit: this.filters.limit,
        chapterName: this.filters.chapterName || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined
      };
      
      const response = await this.testimonialService.getAllTestimonials(requestParams);
      this.testimonials = response;
      
      // Update pagination config
      this.paginationConfig.currentPage = this.testimonials.page;
      this.paginationConfig.totalItems = this.testimonials.totalDocs;
      this.paginationConfig.itemsPerPage = this.testimonials.limit;
      
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      swalHelper.showToast('Failed to fetch testimonials', 'error');
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
    this.fetchTestimonials();
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
    this.fetchTestimonials();
  }

  // Helper method to get profile pic URL
  getProfilePicUrl(picPath: string): string {
    if (!picPath) return 'assets/images/default-avatar.png';
    return `${environment. imageUrl}/${picPath}`;
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
      
      // Prepare data for export - get all testimonials based on current filters
      const exportParams = {
        chapterName: this.filters.chapterName || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined,
        limit: 10000, // Use a large limit to get all data
        page: 1
      };
      
      // Get all data for export
      const allData = await this.testimonialService.getAllTestimonials(exportParams);
      
      // Transform data for Excel export
      const exportData = allData.docs.map((testimonial, index) => {
        return {
          'Sr No': index + 1,
          'Given By': testimonial.giverId?.name || 'Unknown',
          'From Chapter': testimonial.giverId?.chapter_name || 'N/A',
          'Given To': testimonial.receiverId?.name || 'General Testimonial',
          'To Chapter': testimonial.receiverId?.chapter_name || 'N/A',
          'Comments': testimonial.message || 'No comments',
          'Selected': testimonial.selected ? 'Yes' : 'No',
          'Date': this.formatDate(testimonial.createdAt)
        };
      });
      
      // Generate filename with current date
      const fileName = `Testimonials_Report_${this.formatDateForFileName(new Date())}`;
      
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
      
      // Prepare data for export - get all testimonials based on current filters
      const exportParams = {
        chapterName: this.filters.chapterName || undefined,
        startDate: this.filters.startDate || undefined,
        endDate: this.filters.endDate || undefined,
        limit: 10000, // Use a large limit to get all data
        page: 1
      };
      
      // Get all data for export
      const allData = await this.testimonialService.getAllTestimonials(exportParams);
      
      // Generate filename with current date
      const fileName = `Testimonials_Report_${this.formatDateForFileName(new Date())}`;
      
      // Define columns and data for PDF
      const columns = [
        { header: 'Sr No', dataKey: 'srNo' },
        { header: 'Given By', dataKey: 'givenBy' },
        { header: 'Given To', dataKey: 'givenTo' },
        { header: 'Comments', dataKey: 'comments' },
        { header: 'Selected', dataKey: 'selected' },
        { header: 'Date', dataKey: 'date' }
      ];
      
      const data = allData.docs.map((testimonial, index) => {
        return {
          srNo: index + 1,
          givenBy: `${testimonial.giverId?.name || 'Unknown'}\n(${testimonial.giverId?.chapter_name || 'N/A'})`,
          givenTo: testimonial.receiverId ? 
                 `${testimonial.receiverId?.name || 'Unknown'}\n(${testimonial.receiverId?.chapter_name || 'N/A'})` : 
                 'General Testimonial',
          comments: testimonial.message || 'No comments',
          selected: testimonial.selected ? 'Yes' : 'No',
          date: this.formatDate(testimonial.createdAt)
        };
      });
      
      // Define PDF document title and subtitle
      const title = 'Testimonials Report';
      let subtitle = 'All Testimonials';
      
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