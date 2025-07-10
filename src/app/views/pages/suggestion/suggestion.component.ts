import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { SuggestionService, Suggestion, SuggestionResponse } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-suggestions',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [SuggestionService],
  templateUrl: './suggestion.component.html',
  styleUrls: ['./suggestion.component.css']
})
export class SuggestionsComponent implements OnInit, AfterViewInit {
  suggestions: SuggestionResponse = {
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
  selectedSuggestion: Suggestion | null = null;
  suggestionModal: any;
  editMode: boolean = false;
  formSubmitted: boolean = false;
  statusOptions: string[] = ['pending', 'reviewed', 'implemented', 'rejected'];
  
  
  newSuggestion = {
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
    private suggestionService: SuggestionService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchSuggestions();
    });
  }

  ngOnInit(): void {
    this.fetchSuggestions();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('suggestionModal');
      if (modalElement) {
        this.suggestionModal = new bootstrap.Modal(modalElement);
      }
    }, 300);
  }

  async fetchSuggestions(): Promise<void> {
    this.loading = true;
    
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search
      };
      
      const response = await this.suggestionService.getSuggestions(requestData);
      this.suggestions = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      swalHelper.showToast('Failed to fetch suggestions', 'error');
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
    this.fetchSuggestions();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchSuggestions();
  }

  openUpdateSuggestionModal(suggestion: Suggestion): void {
    this.editMode = true;
    this.selectedSuggestion = suggestion;
    this.newSuggestion = {
      adminResponse: suggestion.adminResponse || '',
      status: suggestion.status
    };
    this.showModal();
  }

  resetForm(): void {
    this.newSuggestion = {
      adminResponse: '',
      status: 'pending'
    };
    this.formSubmitted = false;
  }
  
  showModal(): void {
    this.cdr.detectChanges();
    
    if (this.suggestionModal) {
      this.suggestionModal.show();
    } else {
      try {
        const modalElement = document.getElementById('suggestionModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.suggestionModal = modalInstance;
          modalInstance.show();
        } else {
          $('#suggestionModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        $('#suggestionModal').modal('show');
      }
    }
  }
  
  closeModal(): void {
    if (this.suggestionModal) {
      this.suggestionModal.hide();
    } else {
      $('#suggestionModal').modal('hide');
    }
  }

  async saveSuggestion(form: any): Promise<void> {
    this.formSubmitted = true;
    
    try {
      if (!this.newSuggestion.status) {
        swalHelper.showToast('Please select a status', 'warning');
        return;
      }

      this.loading = true;

      const formData = {
        adminResponse: this.newSuggestion.adminResponse?.trim() || '',
        status: this.newSuggestion.status
      };

      if (this.editMode && this.selectedSuggestion) {
        const response = await this.suggestionService.updateSuggestionStatus(this.selectedSuggestion._id, formData);
        
        if (response && response.success) {
          swalHelper.showToast('Suggestion status updated successfully', 'success');
          this.closeModal();
          this.fetchSuggestions();
        } else {
          swalHelper.showToast(response?.message || 'Failed to update suggestion status', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error saving suggestion:', error);
      swalHelper.showToast(error?.response?.data?.message || error?.message || 'Failed to update suggestion', 'error');
    } finally {
      this.loading = false;
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'in_progress':
        return 'bg-primary';
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}