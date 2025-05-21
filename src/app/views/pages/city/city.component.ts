import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CityService, City, CityResponse } from '../../../services/auth.service';
import { StateService, State } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [CityService, StateService],
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css'],
})
export class CitiesComponent implements OnInit, AfterViewInit {
  cities: CityResponse = {
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
  
  states: State[] = [];
  loading: boolean = false;
  statesLoading: boolean = false;
  searchQuery: string = '';
  selectedCity: City | null = null;
  cityModal: any;
  editMode: boolean = false;
  statesLoaded: boolean = false;
  
  // New property to track the selected state object
  selectedState: State | null = null;
  
  newCity = {
    name: '',
    state_id: '',
    status: false
  };
  
  private searchSubject = new Subject<string>();
  
  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  constructor(
    private cityService: CityService,
    private stateService: StateService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchCities();
    });
  }

  ngOnInit(): void {
    this.fetchCities();
    this.fetchStates();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('cityModal');
      if (modalElement) {
        this.cityModal = new bootstrap.Modal(modalElement);
      } else {
        console.warn('Modal element not found in the DOM');
      }
    }, 300);
  }

  async fetchCities(): Promise<void> {
    this.loading = true;
    
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search
      };
      
      const response = await this.cityService.getAllCities(requestData);
      this.cities = response;
      
      // Ensure we have state data for each city
      if (this.statesLoaded) {
        this.cities.docs = this.cities.docs.map(city => {
          // If state_name is empty but we have state_id, try to get the name
          if (!city.state_name && city.state_id) {
            const stateName = this.getStateName(city.state_id);
            return {
              ...city,
              state_name: stateName !== 'Unknown' ? stateName : city.state_name
            };
          }
          return city;
        });
      }
      
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching cities:', error);
      swalHelper.showToast('Failed to fetch cities', 'error');
    } finally {
      this.loading = false;
    }
  }

  async fetchStates(): Promise<void> {
    this.statesLoading = true;
    this.statesLoaded = false;
    
    try {
      console.log('Fetching states...');
      const response = await this.stateService.getAllStates({
        page: 1,
        limit: 1000,
        search: ''
      });
      
      console.log('States response:', response);
      
      this.states = response.docs;
      this.statesLoaded = true;
      console.log('Available states:', this.states);
      
      // If we already have cities, update their state names
      if (this.cities && this.cities.docs.length > 0) {
        this.fetchCities();
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      swalHelper.showToast('Failed to fetch states', 'error');
    } finally {
      this.statesLoading = false;
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
    this.fetchCities();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchCities();
  }

  async openAddCityModal(): Promise<void> {
    this.editMode = false;
    this.newCity = {
      name: '',
      state_id: '',
      status: false
    };
    this.selectedState = null;
    
    if (!this.statesLoaded) {
      await this.fetchStates();
    }
    
    setTimeout(() => {
      this.showModal();
    }, 100);
  }

  async openEditCityModal(city: City): Promise<void> {
    this.editMode = true;
    this.selectedCity = city;
    
    // Make sure we use the actual state_id if it exists
    this.newCity = {
      name: city.name,
      state_id: city.state_id || '',
      status: city.status
    };
    
    // Find the state object for the selected city
    if (city.state_id) {
      this.selectedState = this.states.find(s => s._id === city.state_id) || null;
    } else {
      this.selectedState = null;
    }
    
    console.log('Editing city:', city);
    console.log('Selected state_id:', this.newCity.state_id);
    console.log('Selected state object:', this.selectedState);
    
    if (!this.statesLoaded) {
      await this.fetchStates();
    }
    
    setTimeout(() => {
      this.showModal();
    }, 100);
  }
  
  // New method to handle state selection
  onStateSelect(state: State): void {
    this.selectedState = state;
    this.newCity.state_id = state._id;
    console.log('State selected:', state);
  }
  
  showModal(): void {
    this.cdr.detectChanges();
    
    if (this.cityModal) {
      this.cityModal.show();
    } else {
      try {
        const modalElement = document.getElementById('cityModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.cityModal = modalInstance;
          modalInstance.show();
        } else {
          // Fallback to jQuery
          $('#cityModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        // Last resort fallback
        $('#cityModal').modal('show');
      }
    }
  }
  
  closeModal(): void {
    if (this.cityModal) {
      this.cityModal.hide();
    } else {
      $('#cityModal').modal('hide');
    }
  }

  async saveCity(): Promise<void> {
    try {
      // Validate form
      if (!this.newCity.name || !this.newCity.state_id) {
        swalHelper.showToast('Please fill all required fields', 'warning');
        return;
      }
      
      this.loading = true;
      
      // Find selected state object if not already set
      if (!this.selectedState && this.newCity.state_id) {
        this.selectedState = this.states.find(s => s._id === this.newCity.state_id) || null;
      }
      
      // Debugging - log the city data we're sending
      console.log('Saving city with data:', this.newCity);
      console.log('Selected state:', this.selectedState);
      
      if (this.editMode && this.selectedCity) {
        // Update existing city
        const cityData: any = {
          name: this.newCity.name,
          state_id: this.newCity.state_id,
          status: this.newCity.status
        };
        
        // Add state_name if we have it
        if (this.selectedState) {
          cityData.state_name = this.selectedState.name;
        }
        
        const response = await this.cityService.updateCity(
          this.selectedCity._id,
          cityData
        );
        
        console.log('Update response:', response);
        
        if (response && response.success) {
          swalHelper.showToast('City updated successfully', 'success');
          this.closeModal();
          this.fetchCities();
        } else {
          swalHelper.showToast(response.message || 'Failed to update city', 'error');
        }
      } else {
        // Create new city
        const cityData: any = {
          name: this.newCity.name,
          state_id: this.newCity.state_id,
          status: this.newCity.status
        };
        
        // Add state_name if we have it
        if (this.selectedState) {
          cityData.state_name = this.selectedState.name;
        }
        
        const response = await this.cityService.createCity(cityData);
        
        console.log('Create response:', response);
        
        if (response && response.success) {
          swalHelper.showToast('City created successfully', 'success');
          this.closeModal();
          this.fetchCities();
        } else {
          swalHelper.showToast(response.message || 'Failed to create city', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving city:', error);
      swalHelper.showToast('Failed to save city', 'error');
    } finally {
      this.loading = false;
    }
  }

  async toggleCityStatus(city: City): Promise<void> {
    try {
      this.loading = true;
      
      const updatedStatus = !city.status;
      
      // Create update data object with type 'any' to allow additional properties
      const updateData: any = { 
        name: city.name, 
        state_id: city.state_id,
        status: updatedStatus 
      };
      
      // Only add state_name if it exists in the city object
      if (city.state_name) {
        updateData.state_name = city.state_name;
      }
      
      const response = await this.cityService.updateCity(
        city._id,
        updateData
      );
      
      if (response && response.success) {
        city.status = updatedStatus;
        swalHelper.showToast(`City status changed to ${updatedStatus ? 'Active' : 'Inactive'}`, 'success');
      } else {
        swalHelper.showToast(response.message || 'Failed to update city status', 'error');
      }
    } catch (error) {
      console.error('Error updating city status:', error);
      swalHelper.showToast('Failed to update city status', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deleteCity(cityId: string): Promise<void> {
    try {
      const result = await swalHelper.confirmation(
        'Delete City',
        'Are you sure you want to delete this city? This action cannot be undone.',
        'warning'
      );
      
      if (result.isConfirmed) {
        this.loading = true;
        
        try {
          const response = await this.cityService.deleteCity(cityId);
          
          if (response && response.success) {
            swalHelper.showToast('City deleted successfully', 'success');
            this.fetchCities();
          } else {
            swalHelper.showToast(response.message || 'Failed to delete city', 'error');
          }
        } catch (error) {
          console.error('Error deleting city:', error);
          swalHelper.showToast('Failed to delete city', 'error');
        } finally {
          this.loading = false;
        }
      }
    } catch (error) {
      console.error('Confirmation dialog error:', error);
    }
  }

  // Helper to find state name by id
  getStateName(stateId: string): string {
    if (!stateId) return 'Unknown';
    const state = this.states.find(s => s._id === stateId);
    return state ? state.name : 'Unknown';
  }

  // Format date helper function
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
}