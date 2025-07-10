import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/env/env.local';
import { ComplaintService, Complaint, ComplaintResponse } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [ComplaintService],
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.css']
})
export class ComplaintsComponent implements OnInit, AfterViewInit {
  complaints: ComplaintResponse = {
    docs: [],
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null
  };
  
  loading: boolean = false;
  searchQuery: string = '';
  selectedComplaint: Complaint | null = null;
  complaintModal: any;
  imagePreviewModal: any;
  editMode: boolean = false;
  formSubmitted: boolean = false;
  statusOptions: string[] = ['pending', 'in_progress', 'resolved', 'rejected'];
  
  newComplaint = {
    adminResponse: '',
    status: 'pending'
  };
  
  private searchSubject = new Subject<string>();
  
  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  constructor(
    private complaintService: ComplaintService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchComplaints();
    });
  }

  ngOnInit(): void {
    this.fetchComplaints();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('complaintModal');
      if (modalElement) {
        this.complaintModal = new bootstrap.Modal(modalElement);
      }
      
      const imagePreviewModalElement = document.getElementById('imagePreviewModal');
      if (imagePreviewModalElement) {
        this.imagePreviewModal = new bootstrap.Modal(imagePreviewModalElement);
      }
    }, 300);
  }

  async fetchComplaints(): Promise<void> {
    this.loading = true;
    
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search
      };
      
      const response = await this.complaintService.getComplaints(requestData);
      this.complaints = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching complaints:', error);
      swalHelper.showToast('Failed to fetch complaints', 'error');
    } finally {
      this.loading = false;
    }
  }

  onSearch(): void {
    this.payload.page = 1;
    this.payload.search = this.searchQuery;
    this.searchSubject.next(this.searchQuery);
  }
  
  onChange(): void {
    this.payload.page = 1;
    this.fetchComplaints();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchComplaints();
  }

  openUpdateComplaintModal(complaint: Complaint): void {
    this.editMode = true;
    this.selectedComplaint = complaint;
    this.newComplaint = {
      adminResponse: complaint.adminResponse || '',
      status: complaint.status
    };
    this.showModal();
  }

  openImagePreview(complaint: Complaint): void {
    this.selectedComplaint = complaint;
    this.showImagePreviewModal();
  }

  resetForm(): void {
    this.newComplaint = {
      adminResponse: '',
      status: 'pending'
    };
    this.formSubmitted = false;
  }
  
  showModal(): void {
    this.cdr.detectChanges();
    
    if (this.complaintModal) {
      this.complaintModal.show();
    } else {
      try {
        const modalElement = document.getElementById('complaintModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.complaintModal = modalInstance;
          modalInstance.show();
        } else {
          $('#complaintModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        $('#complaintModal').modal('show');
      }
    }
  }

  showImagePreviewModal(): void {
    this.cdr.detectChanges();
    
    if (this.imagePreviewModal) {
      this.imagePreviewModal.show();
    } else {
      try {
        const modalElement = document.getElementById('imagePreviewModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.imagePreviewModal = modalInstance;
          modalInstance.show();
        } else {
          $('#imagePreviewModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing image preview modal:', error);
        $('#imagePreviewModal').modal('show');
      }
    }
  }
  
  closeModal(): void {
    if (this.complaintModal) {
      this.complaintModal.hide();
    } else {
      $('#complaintModal').modal('hide');
    }
  }

  async saveComplaint(form: any): Promise<void> {
    this.formSubmitted = true;
    
    try {
      if (!this.newComplaint.status) {
        swalHelper.showToast('Please select a status', 'warning');
        return;
      }

      this.loading = true;

      const formData = {
        adminResponse: this.newComplaint.adminResponse?.trim() || '',
        status: this.newComplaint.status
      };

      if (this.editMode && this.selectedComplaint) {
        const response = await this.complaintService.updateComplaintStatus(this.selectedComplaint._id, formData);
        
        if (response && response.success) {
          swalHelper.showToast('Complaint status updated successfully', 'success');
          this.closeModal();
          this.fetchComplaints();
        } else {
          swalHelper.showToast(response?.message || 'Failed to update complaint status', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error saving complaint:', error);
      swalHelper.showToast(error?.response?.data?.message || error?.message || 'Failed to update complaint', 'error');
    } finally {
      this.loading = false;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    const baseUrl = environment.imageUrl;
    return imagePath.startsWith('http') ? imagePath : baseUrl + imagePath;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'in_progress':
        return 'bg-primary';
      case 'resolved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}