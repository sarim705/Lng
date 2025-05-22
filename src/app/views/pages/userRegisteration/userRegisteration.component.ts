import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RegisterUserAuthService, User } from '../../../services/auth.service';
import { CountryService, Country } from '../../../services/auth.service';
import { StateService, State } from '../../../services/auth.service';
import { CityService, City } from '../../../services/auth.service';
import { ChapterService, Chapter } from '../../../services/auth.service';
import { AuthService } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  providers: [RegisterUserAuthService, CountryService, StateService, CityService, ChapterService, AuthService],
  templateUrl: './userRegisteration.component.html',
  styleUrls: ['./userRegisteration.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  registerForm: any = {
    name: '',
    email: '',
    mobile_number: '',
    chapter_name: '',
    meeting_role: '',
    profilePic: null,
    date_of_birth: '',
    city: '',
    state: '',
    country: '',
    sponseredBy: '',
    keywords:''
  };

  countries: Country[] = [];
  states: State[] = [];
  cities: City[] = [];
  chapters: Chapter[] = [];
  users: User[] = [];
  
  loading: boolean = false;
  countriesLoading: boolean = false;
  statesLoading: boolean = false;
  citiesLoading: boolean = false;
  chaptersLoading: boolean = false;
  usersLoading: boolean = false;
  
  countriesLoaded: boolean = false;
  statesLoaded: boolean = false;
  citiesLoaded: boolean = false;
  chaptersLoaded: boolean = false;
  usersLoaded: boolean = false;

  // Add meetingRoles array to fix the error
  meetingRoles = [
    { name: 'Leader', value: 'Leader' },
    { name: 'Member', value: 'Member' }
  ];

  private searchSubject = new Subject<string>();
  registerModal: any;

  constructor(
    private registerService: RegisterUserAuthService,
    private countryService: CountryService,
    private stateService: StateService,
    private cityService: CityService,
    private chapterService: ChapterService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.fetchUsers();
    });
  }

  ngOnInit(): void {
    this.fetchCountries();
    this.fetchStates();
    this.fetchCities();
    this.fetchChapters();
    this.fetchUsers();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('registerModal');
      if (modalElement) {
        this.registerModal = new bootstrap.Modal(modalElement);
      }
    }, 300);
  }

  async fetchCountries(): Promise<void> {
    this.countriesLoading = true;
    this.countriesLoaded = false;
    try {
      const response = await this.countryService.getAllCountries({
        page: 1,
        limit: 1000,
        search: ''
      });
      this.countries = response.docs;
      this.countriesLoaded = true;
    } catch (error) {
      console.error('Error fetching countries:', error);
      swalHelper.showToast('Failed to fetch countries', 'error');
    } finally {
      this.countriesLoading = false;
      this.cdr.detectChanges();
    }
  }

  async fetchStates(): Promise<void> {
    this.statesLoading = true;
    this.statesLoaded = false;
    try {
      const response = await this.stateService.getAllStates({
        page: 1,
        limit: 1000,
        search: ''
      });
      this.states = response.docs;
      this.statesLoaded = true;
    } catch (error) {
      console.error('Error fetching states:', error);
      swalHelper.showToast('Failed to fetch states', 'error');
    } finally {
      this.statesLoading = false;
      this.cdr.detectChanges();
    }
  }

  async fetchCities(): Promise<void> {
    this.citiesLoading = true;
    this.citiesLoaded = false;
    try {
      const response = await this.cityService.getAllCities({
        page: 1,
        limit: 1000,
        search: ''
      });
      this.cities = response.docs;
      this.citiesLoaded = true;
    } catch (error) {
      console.error('Error fetching cities:', error);
      swalHelper.showToast('Failed to fetch cities', 'error');
    } finally {
      this.citiesLoading = false;
      this.cdr.detectChanges();
    }
  }

  async fetchChapters(): Promise<void> {
    this.chaptersLoading = true;
    this.chaptersLoaded = false;
    try {
      const response = await this.chapterService.getAllChapters({
        page: 1,
        limit: 1000,
        search: ''
      });
      this.chapters = response.docs;
      this.chaptersLoaded = true;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      swalHelper.showToast('Failed to fetch chapters', 'error');
    } finally {
      this.chaptersLoading = false;
      this.cdr.detectChanges();
    }
  }

  async fetchUsers(): Promise<void> {
    this.usersLoading = true;
    this.usersLoaded = false;
    try {
      const response = await this.authService.getUsers({
        page: 1,
        limit: 1000,
        search: ''
      });
      this.users = response.docs;
      this.usersLoaded = true;
    } catch (error) {
      console.error('Error fetching users:', error);
      swalHelper.showToast('Failed to fetch users', 'error');
    } finally {
      this.usersLoading = false;
      this.cdr.detectChanges();
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.registerForm.profilePic = file;
    }
  }

  async registerUser(): Promise<void> {
    try {
      if (!this.validateForm()) {
        swalHelper.showToast('Please fill all required fields', 'warning');
        return;
      }

      this.loading = true;
      const formData = new FormData();
      
      // Append form fields
      Object.keys(this.registerForm).forEach(key => {
        if (key === 'profilePic' && this.registerForm[key]) {
          formData.append(key, this.registerForm[key]);
        } else if (this.registerForm[key]) {
          formData.append(key, this.registerForm[key]);
        }
      });

      const response = await this.registerService.registerUser(formData);
      
      if (response && response.success) {
        swalHelper.showToast('User registered successfully', 'success');
        this.closeModal();
        this.resetForm();
      } else {
        swalHelper.showToast(response.message || 'Failed to register user', 'error');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      swalHelper.showToast('Failed to register user', 'error');
    } finally {
      this.loading = false;
    }
  }

  validateForm(): boolean {
    return !!(this.registerForm.name &&
             this.registerForm.email &&
             this.registerForm.mobile_number &&
             this.registerForm.chapter_name &&
             this.registerForm.meeting_role &&
            
             this.registerForm.city &&
             this.registerForm.state &&
             this.registerForm.country);
  }

  resetForm(): void {
    this.registerForm = {
      name: '',
      email: '',
      mobile_number: '',
      chapter_name: '',
      meeting_role: '',
      profilePic: null,
     
      city: '',
      state: '',
      country: '',
      sponseredBy: '',
      keywords: ''
    };
  }

  showModal(): void {
    this.cdr.detectChanges();
    if (this.registerModal) {
      this.registerModal.show();
    } else {
      $('#registerModal').modal('show');
    }
  }

  closeModal(): void {
    if (this.registerModal) {
      this.registerModal.hide();
    } else {
      $('#registerModal').modal('hide');
    }
  }

  openRegisterModal(): void {
    this.resetForm();
    setTimeout(() => {
      this.showModal();
    }, 100);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }
}