import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { BadgeService, Badge, BadgeResponse } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [BadgeService],
  templateUrl: './badges.component.html',
  styleUrls: ['./badges.component.css'],
})
export class BadgesComponent implements OnInit, AfterViewInit {
  badges: BadgeResponse = {
    docs: [],
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 0,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
    message: '',
    success: true,
  };

  loading: boolean = false;
  searchQuery: string = '';
  selectedBadge: Badge | null = null;
  badgeModal: any;
  editMode: boolean = false;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  newBadge: Badge = {
    name: '',
    description: '',
    image: '',
    isActive: false,
    _id: '',
    createdAt: '',
    updatedAt: '',
    __v: 0,
  };

  private searchSubject = new Subject<string>();

  payload = {
    search: '',
    page: 1,
    limit: 10,
  };

  constructor(
    private badgeService: BadgeService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.fetchBadges();
    });
  }

  ngOnInit(): void {
    this.fetchBadges();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('badgeModal');
      if (modalElement) {
        this.badgeModal = new bootstrap.Modal(modalElement);
      } else {
        console.warn('Modal element not found in the DOM');
      }
    }, 300);
  }

  async fetchBadges(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.badgeService.getAllBadges(this.payload);
      this.badges = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching badges:', error);
      swalHelper.showToast('Failed to fetch badges', 'error');
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
    this.fetchBadges();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchBadges();
  }

  openAddBadgeModal(): void {
    this.editMode = false;
    this.newBadge = {
      name: '',
      description: '',
      image: '',
      isActive: false,
      _id: '',
      createdAt: '',
      updatedAt: '',
      __v: 0,
    };
    this.imagePreview = null;
    this.selectedFile = null;
    this.showModal();
  }

  openEditBadgeModal(badge: Badge): void {
    this.editMode = true;
    this.selectedBadge = badge;
    this.newBadge = { ...badge };
    this.imagePreview = badge.image;
    this.selectedFile = null;
    this.cdr.detectChanges();
    setTimeout(() => this.showModal(), 100);
  }

  showModal(): void {
    this.cdr.detectChanges();
    if (this.badgeModal) {
      this.badgeModal.show();
    } else {
      try {
        const modalElement = document.getElementById('badgeModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.badgeModal = modalInstance;
          modalInstance.show();
        } else {
          $('#badgeModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        $('#badgeModal').modal('show');
      }
    }
  }

  closeModal(): void {
    if (this.badgeModal) {
      this.badgeModal.hide();
    } else {
      $('#badgeModal').modal('hide');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-image.png'; // Fallback image
  }

  async saveBadge(): Promise<void> {
    try {
      this.loading = true;
      const formData = new FormData();
      formData.append('name', this.newBadge.name);
      formData.append('description', this.newBadge.description);
      formData.append('isActive', this.newBadge.isActive.toString());
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      if (this.editMode && this.selectedBadge) {
        const response = await this.badgeService.updateBadge(this.selectedBadge._id, formData);
        if (response.success && (response.status === 200 || response.status === 201)) {
          swalHelper.showToast(response.message || 'Badge updated successfully', 'success');
          this.closeModal();
          this.fetchBadges();
        } else {
          swalHelper.showToast(response.message || 'Failed to update badge', 'error');
        }
      } else {
        const response = await this.badgeService.createBadge(formData);
        if (response.success && (response.status === 201 || response.status === 200)) {
          swalHelper.showToast(response.message || 'Badge created successfully', 'success');
          this.closeModal();
          this.fetchBadges();
        } else {
          swalHelper.showToast(response.message || 'Failed to create badge', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving badge:', error);
      swalHelper.showToast('Failed to save badge', 'error');
    } finally {
      this.loading = false;
    }
  }

  async toggleBadgeStatus(badge: Badge): Promise<void> {
    try {
      this.loading = true;
      const updatedStatus = !badge.isActive;
      const formData = new FormData();
      formData.append('name', badge.name);
      formData.append('description', badge.description);
      formData.append('isActive', updatedStatus.toString());

      const response = await this.badgeService.updateBadge(badge._id, formData);
      if (response.success && (response.status === 200 || response.status === 201)) {
        badge.isActive = updatedStatus;
        swalHelper.showToast(`Badge status changed to ${updatedStatus ? 'Active' : 'Inactive'}`, 'success');
        this.fetchBadges();
      } else {
        swalHelper.showToast(response.message || 'Failed to update badge status', 'error');
      }
    } catch (error) {
      console.error('Error updating badge status:', error);
      swalHelper.showToast('Failed to update badge status', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deleteBadge(badgeId: string): Promise<void> {
    try {
      const result = await swalHelper.confirmation(
        'Delete Badge',
        'Are you sure you want to delete this badge? This action cannot be undone.',
        'warning'
      );
      if (result.isConfirmed) {
        this.loading = true;
        try {
          const response = await this.badgeService.deleteBadge(badgeId);
          if (response && response.success) {
            swalHelper.showToast(response.message || 'Badge deleted successfully', 'success');
            this.fetchBadges();
          } else {
            swalHelper.showToast(response.message || 'Failed to delete badge', 'error');
          }
        } catch (error) {
          console.error('Error deleting badge:', error);
          swalHelper.showToast('Failed to delete badge', 'error');
        } finally {
          this.loading = false;
        }
      }
    } catch (error) {
      console.error('Confirmation dialog error:', error);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
}