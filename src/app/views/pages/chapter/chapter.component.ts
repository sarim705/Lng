import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChapterService, Chapter, ChapterResponse } from '../../../services/auth.service';
import { CityService, City } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-chapters',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [ChapterService, CityService],
  templateUrl: './chapter.component.html',
  styleUrls: ['./chapter.component.css'],
})
export class ChaptersComponent implements OnInit, AfterViewInit {
  chapters: ChapterResponse = {
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
  
  cities: City[] = [];
  loading: boolean = false;
  citiesLoading: boolean = false;
  searchQuery: string = '';
  selectedChapter: Chapter | null = null;
  chapterModal: any;
  editMode: boolean = false;
  citiesLoaded: boolean = false;
  
  newChapter = {
    name: '',
    city_id: '',
    city_name: '',
    status: false
  };
  
  // Property to track the selected city object
  selectedCity: City | null = null;
  
  private searchSubject = new Subject<string>();
  
  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  constructor(
    private chapterService: ChapterService,
    private cityService: CityService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.fetchChapters();
    });
  }

  ngOnInit(): void {
    this.fetchChapters();
    this.fetchCities();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('chapterModal');
      if (modalElement) {
        this.chapterModal = new bootstrap.Modal(modalElement);
      } else {
        console.warn('Modal element not found in the DOM');
      }
    }, 300);
  }

  async fetchChapters(): Promise<void> {
    this.loading = true;
    
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search
      };
      
      const response = await this.chapterService.getAllChapters(requestData);
      this.chapters = response;
      
      // Ensure we have city data for each chapter
      if (this.citiesLoaded) {
        this.chapters.docs = this.chapters.docs.map(chapter => {
          // If city_name is empty but we have city_id, try to get the name
          if (!chapter.city_name && chapter.city_id) {
            const cityName = this.getCityName(chapter.city_id);
            return {
              ...chapter,
              city_name: cityName || chapter.city_name
            };
          }
          return chapter;
        });
      }
      
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching chapters:', error);
      swalHelper.showToast('Failed to fetch chapters', 'error');
    } finally {
      this.loading = false;
    }
  }

  async fetchCities(): Promise<void> {
    this.citiesLoading = true;
    this.citiesLoaded = false;
    
    try {
      console.log('Fetching cities...');
      const response = await this.cityService.getAllCities({
        page: 1,
        limit: 1000,
        search: ''
      });
      
      console.log('Cities response:', response);
      
      this.cities = response.docs;
      this.citiesLoaded = true;
      console.log('Available cities:', this.cities);
      
      // If we already have chapters, update their city names
      if (this.chapters && this.chapters.docs.length > 0) {
        this.fetchChapters();
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      swalHelper.showToast('Failed to fetch cities', 'error');
    } finally {
      this.citiesLoading = false;
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
    this.fetchChapters();
  }

  onPageChange(page: number): void {
    this.payload.page = page;
    this.fetchChapters();
  }

  async openAddChapterModal(): Promise<void> {
    this.editMode = false;
    this.newChapter = {
      name: '',
      city_id: '',
      city_name: '',
      status: false
    };
    this.selectedCity = null;
    
    if (!this.citiesLoaded) {
      await this.fetchCities();
    }
    
    setTimeout(() => {
      this.showModal();
    }, 100);
  }

  async openEditChapterModal(chapter: Chapter): Promise<void> {
    this.editMode = true;
    this.selectedChapter = chapter;
    
    // Make sure we use the actual city_id if it exists
    this.newChapter = {
      name: chapter.name,
      city_id: chapter.city_id || '',
      city_name: chapter.city_name || '',
      status: chapter.status
    };
    
    // Find the city object for the selected chapter
    if (chapter.city_id) {
      this.selectedCity = this.cities.find(c => c._id === chapter.city_id) || null;
    } else {
      this.selectedCity = null;
    }
    
    console.log('Editing chapter:', chapter);
    console.log('Selected city_id:', this.newChapter.city_id);
    console.log('Selected city object:', this.selectedCity);
    
    if (!this.citiesLoaded) {
      await this.fetchCities();
    }
    
    setTimeout(() => {
      this.showModal();
    }, 100);
  }
  
  showModal(): void {
    this.cdr.detectChanges();
    
    if (this.chapterModal) {
      this.chapterModal.show();
    } else {
      try {
        const modalElement = document.getElementById('chapterModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.chapterModal = modalInstance;
          modalInstance.show();
        } else {
          // Fallback to jQuery
          $('#chapterModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        // Last resort fallback
        $('#chapterModal').modal('show');
      }
    }
  }
  
  closeModal(): void {
    if (this.chapterModal) {
      this.chapterModal.hide();
    } else {
      $('#chapterModal').modal('hide');
    }
  }

  // Method to handle city selection
  onCitySelect(city: City): void {
    this.selectedCity = city;
    this.newChapter.city_id = city._id;
    this.newChapter.city_name = city.name;
    console.log('City selected:', city);
  }

  async saveChapter(): Promise<void> {
    try {
      // Validate form
      if (!this.newChapter.name) {
        swalHelper.showToast('Please enter chapter name', 'warning');
        return;
      }
      
      this.loading = true;
      
      // Find selected city object if not already set
      if (!this.selectedCity && this.newChapter.city_id) {
        this.selectedCity = this.cities.find(c => c._id === this.newChapter.city_id) || null;
        if (this.selectedCity) {
          this.newChapter.city_name = this.selectedCity.name;
        }
      }
      
      // Debugging - log the chapter data we're sending
      console.log('Saving chapter with data:', this.newChapter);
      console.log('Selected city:', this.selectedCity);
      
      if (this.editMode && this.selectedChapter) {
        // Update existing chapter
        const chapterData: any = {
          name: this.newChapter.name,
          city_id: this.newChapter.city_id,
          city_name: this.newChapter.city_name,
          status: this.newChapter.status
        };
        
        const response = await this.chapterService.updateChapter(
          this.selectedChapter._id,
          chapterData
        );
        
        console.log('Update response:', response);
        
        if (response && response.success) {
          swalHelper.showToast('Chapter updated successfully', 'success');
          this.closeModal();
          this.fetchChapters();
        } else {
          swalHelper.showToast(response.message || 'Failed to update chapter', 'error');
        }
      } else {
        // Create new chapter
        const chapterData: any = {
          name: this.newChapter.name,
          city_id: this.newChapter.city_id,
          city_name: this.newChapter.city_name,
          status: this.newChapter.status
        };
        
        const response = await this.chapterService.createChapter(chapterData);
        
        console.log('Create response:', response);
        
        if (response && response.success) {
          swalHelper.showToast('Chapter created successfully', 'success');
          this.closeModal();
          this.fetchChapters();
        } else {
          swalHelper.showToast(response.message || 'Failed to create chapter', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving chapter:', error);
      swalHelper.showToast('Failed to save chapter', 'error');
    } finally {
      this.loading = false;
    }
  }

  async toggleChapterStatus(chapter: Chapter): Promise<void> {
    try {
      this.loading = true;
      
      const updatedStatus = !chapter.status;
      
      const response = await this.chapterService.updateChapter(
        chapter._id,
        { 
          name: chapter.name, 
          city_id: chapter.city_id,
          city_name: chapter.city_name,
          status: updatedStatus 
        }
      );
      
      if (response && response.success) {
        chapter.status = updatedStatus;
        swalHelper.showToast(`Chapter status changed to ${updatedStatus ? 'Active' : 'Inactive'}`, 'success');
      } else {
        swalHelper.showToast(response.message || 'Failed to update chapter status', 'error');
      }
    } catch (error) {
      console.error('Error updating chapter status:', error);
      swalHelper.showToast('Failed to update chapter status', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deleteChapter(chapterId: string): Promise<void> {
    try {
      const result = await swalHelper.confirmation(
        'Delete Chapter',
        'Are you sure you want to delete this chapter? This action cannot be undone.',
        'warning'
      );
      
      if (result.isConfirmed) {
        this.loading = true;
        
        try {
          const response = await this.chapterService.deleteChapter(chapterId);
          
          if (response && response.success) {
            swalHelper.showToast('Chapter deleted successfully', 'success');
            this.fetchChapters();
          } else {
            swalHelper.showToast(response.message || 'Failed to delete chapter', 'error');
          }
        } catch (error) {
          console.error('Error deleting chapter:', error);
          swalHelper.showToast('Failed to delete chapter', 'error');
        } finally {
          this.loading = false;
        }
      }
    } catch (error) {
      console.error('Confirmation dialog error:', error);
    }
  }

  // Helper to find city name by id
  getCityName(cityId: string): string {
    if (!cityId) return 'Unknown';
    const city = this.cities.find(c => c._id === cityId);
    return city ? city.name : 'Unknown';
  }

  // Format date helper function
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
}