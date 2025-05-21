import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, State, StateResponse } from '../../../services/auth.service';
import { CountryService, Country } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-states',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [StateService, CountryService],
  templateUrl: './states.component.html',
  styleUrls: ['./states.component.css'],
})
export class StatesComponent implements OnInit, AfterViewInit {
  states: StateResponse = {
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
  
  countries: Country[] = [];
  loading: boolean = false;
  countriesLoading: boolean = false;
  searchQuery: string = '';
  selectedState: State | null = null;
  stateModal: any;
  editMode: boolean = false;
  countriesLoaded: boolean = false;
  
  newState = {
    name: '',
    country_id: '',
    status: false
  };
  
  // New property to track the selected country object
  selectedCountry: Country | null = null;
  
  private searchSubject = new Subject<string>();
  
  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  constructor(
    private stateService: StateService,
    private countryService: CountryService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchStates();
    });
  }

  ngOnInit(): void {
    this.fetchStates();
    this.fetchCountries();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('stateModal');
      if (modalElement) {
        this.stateModal = new bootstrap.Modal(modalElement);
      } else {
        console.warn('Modal element not found in the DOM');
      }
    }, 300);
  }

  async fetchStates(): Promise<void> {
    this.loading = true;
    
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search
      };
      
      const response = await this.stateService.getAllStates(requestData);
      this.states = response;
      
      // Ensure we have country data for each state
      if (this.countriesLoaded) {
        this.states.docs = this.states.docs.map(state => {
          // If country_name is empty but we have country_id, try to get the name
          if (!state.country_name && state.country_id) {
            const countryName = this.getCountryName(state.country_id);
            return {
              ...state,
              country_name: countryName !== 'India' ? countryName : state.country_name
            };
          }
          return state;
        });
      }
      
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching states:', error);
      swalHelper.showToast('Failed to fetch states', 'error');
    } finally {
      this.loading = false;
    }
  }

  async fetchCountries(): Promise<void> {
    this.countriesLoading = true;
    this.countriesLoaded = false;
    
    try {
      console.log('Fetching countries...');
      const response = await this.countryService.getAllCountries({
        page: 1,
        limit: 1000,
        search: ''
      });
      
      console.log('Countries response:', response);
      
      this.countries = response.docs;
      this.countriesLoaded = true;
      console.log('Available countries:', this.countries);
      
      // If we already have states, update their country names
      if (this.states && this.states.docs.length > 0) {
        this.fetchStates();
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
      swalHelper.showToast('Failed to fetch countries', 'error');
    } finally {
      this.countriesLoading = false;
      this.cdr.detectChanges();
    }
  }

  onSearch(): void {
    this.payload.page = 1;
    this.payload.search = this.searchQuery;
    this.searchSubject.next(this.searchQuery);
  }
  
  onChange(): void {
    this.payload.page = 1;
    this.fetchStates();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchStates();
  }

  async openAddStateModal(): Promise<void> {
    this.editMode = false;
    this.newState = {
      name: '',
      country_id: '',
      status: false
    };
    this.selectedCountry = null;
    
    if (!this.countriesLoaded) {
      await this.fetchCountries();
    }
    
    setTimeout(() => {
      this.showModal();
    }, 100);
  }

  async openEditStateModal(state: State): Promise<void> {
    this.editMode = true;
    this.selectedState = state;
    
    // Make sure we use the actual country_id if it exists
    this.newState = {
      name: state.name,
      country_id: state.country_id || '',
      status: state.status
    };
    
    // Find the country object for the selected state
    if (state.country_id) {
      this.selectedCountry = this.countries.find(c => c._id === state.country_id) || null;
    } else {
      this.selectedCountry = null;
    }
    
    console.log('Editing state:', state);
    console.log('Selected country_id:', this.newState.country_id);
    console.log('Selected country object:', this.selectedCountry);
    
    if (!this.countriesLoaded) {
      await this.fetchCountries();
    }
    
    setTimeout(() => {
      this.showModal();
    }, 100);
  }
  
  showModal(): void {
    this.cdr.detectChanges();
    
    if (this.stateModal) {
      this.stateModal.show();
    } else {
      try {
        const modalElement = document.getElementById('stateModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.stateModal = modalInstance;
          modalInstance.show();
        } else {
          // Fallback to jQuery
          $('#stateModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        // Last resort fallback
        $('#stateModal').modal('show');
      }
    }
  }
  
  closeModal(): void {
    if (this.stateModal) {
      this.stateModal.hide();
    } else {
      $('#stateModal').modal('hide');
    }
  }

  // New method to handle country selection
  onCountrySelect(country: Country): void {
    this.selectedCountry = country;
    this.newState.country_id = country._id;
    console.log('Country selected:', country);
  }

  async saveState(): Promise<void> {
    try {
      // Validate form
      if (!this.newState.name || !this.newState.country_id) {
        swalHelper.showToast('Please fill all required fields', 'warning');
        return;
      }
      
      this.loading = true;
      
      // Find selected country object if not already set
      if (!this.selectedCountry && this.newState.country_id) {
        this.selectedCountry = this.countries.find(c => c._id === this.newState.country_id) || null;
      }
      
      // Debugging - log the state data we're sending
      console.log('Saving state with data:', this.newState);
      console.log('Selected country:', this.selectedCountry);
      
      if (this.editMode && this.selectedState) {
        // Update existing state
        const stateData: any = {
          name: this.newState.name,
          country_id: this.newState.country_id,
          status: this.newState.status
        };
        
        // Add country_name if we have it
        if (this.selectedCountry) {
          stateData.country_name = this.selectedCountry.name;
        }
        
        const response = await this.stateService.updateState(
          this.selectedState._id,
          stateData
        );
        
        console.log('Update response:', response);
        
        if (response && response.success) {
          swalHelper.showToast('State updated successfully', 'success');
          this.closeModal();
          this.fetchStates();
        } else {
          swalHelper.showToast(response.message || 'Failed to update state', 'error');
        }
      } else {
        // Create new state
        const stateData: any = {
          name: this.newState.name,
          country_id: this.newState.country_id,
          status: this.newState.status
        };
        
        // Add country_name if we have it
        if (this.selectedCountry) {
          stateData.country_name = this.selectedCountry.name;
        }
        
        const response = await this.stateService.createState(stateData);
        
        console.log('Create response:', response);
        
        if (response && response.success) {
          swalHelper.showToast('State created successfully', 'success');
          this.closeModal();
          this.fetchStates();
        } else {
          swalHelper.showToast(response.message || 'Failed to create state', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving state:', error);
      swalHelper.showToast('Failed to save state', 'error');
    } finally {
      this.loading = false;
    }
  }

  async toggleStateStatus(state: State): Promise<void> {
    try {
      this.loading = true;
      
      const updatedStatus = !state.status;
      
      const response = await this.stateService.updateState(
        state._id,
        { 
          name: state.name, 
          country_id: state.country_id,
          status: updatedStatus 
        }
      );
      
      if (response && response.success) {
        state.status = updatedStatus;
        swalHelper.showToast(`State status changed to ${updatedStatus ? 'Active' : 'Inactive'}`, 'success');
      } else {
        swalHelper.showToast(response.message || 'Failed to update state status', 'error');
      }
    } catch (error) {
      console.error('Error updating state status:', error);
      swalHelper.showToast('Failed to update state status', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deleteState(stateId: string): Promise<void> {
    try {
      const result = await swalHelper.confirmation(
        'Delete State',
        'Are you sure you want to delete this state? This action cannot be undone.',
        'warning'
      );
      
      if (result.isConfirmed) {
        this.loading = true;
        
        try {
          const response = await this.stateService.deleteState(stateId);
          
          if (response && response.success) {
            swalHelper.showToast('State deleted successfully', 'success');
            this.fetchStates();
          } else {
            swalHelper.showToast(response.message || 'Failed to delete state', 'error');
          }
        } catch (error) {
          console.error('Error deleting state:', error);
          swalHelper.showToast('Failed to delete state', 'error');
        } finally {
          this.loading = false;
        }
      }
    } catch (error) {
      console.error('Confirmation dialog error:', error);
    }
  }

  // Helper to find country name by id
  getCountryName(countryId: string): string {
    if (!countryId) return 'Unknown';
    const country = this.countries.find(c => c._id === countryId);
    return country ? country.name : 'Unknown';
  }

  // Format date helper function
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
}