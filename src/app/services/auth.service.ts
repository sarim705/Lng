import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { environment } from 'src/env/env.local';
import { HttpParams } from '@angular/common/http';

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  admin: {
    _id: string;
    name: string;
    email: string;
    password: string;
    createdAt: string;
    __v: number;
  };
}

export interface CountryResponse {
  docs: Country[];
  totalDocs: string | number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}


export interface AdminLoginResponse {
  success: boolean;
  token: string;
  admin: {
    _id: string;
    name: string;
    email: string;
    password: string;
    createdAt: string;
    __v: number;
  };
}

export interface Country {
  _id: string;
  name: string;
  status: boolean;
  createdAt: string;
  __v: number;
}

export interface StateResponse {
  docs: State[];
  totalDocs: string | number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface State {
  _id: string;
  name: string;
  country_id: string;
  country_name?: string;
  status: boolean;
  createdAt: string;
  __v: number;
}

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private headers: any = [];
  
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getAllCountries(data: { page: number; limit: number; search: string }): Promise<CountryResponse> {
    try {
      this.getHeaders();
      
      // Create query parameters
      let queryParams = `?page=${data.page}&limit=${data.limit}`;
      if (data.search) {
        queryParams += `&search=${encodeURIComponent(data.search)}`;
      }
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_COUNTRIES + queryParams,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      // Return just the data part of the response, which should match CountryResponse
      return response.data || response;
    } catch (error) {
      console.error('API Error:', error);
      swalHelper.showToast('Failed to fetch countries', 'error');
      throw error;
    }
  }

  async createCountry(data: { name: string; status: boolean }): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CREATE_COUNTRY,
          method: 'POST',
        },
        data,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Create Country Error:', error);
      swalHelper.showToast('Failed to create country', 'error');
      throw error;
    }
  }

  async updateCountry(id: string, data: { name: string; status: boolean }): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.UPDATE_COUNTRY}/${id}`,
          method: 'PUT',
        },
        data,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Update Country Error:', error);
      swalHelper.showToast('Failed to update country', 'error');
      throw error;
    }
  }

  async getCountryById(id: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_COUNTRY_BY_ID}/${id}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Get Country By ID Error:', error);
      swalHelper.showToast('Failed to fetch country details', 'error');
      throw error;
    }
  }

  async deleteCountry(id: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.DELETE_COUNTRY}/${id}`,
          method: 'DELETE',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Delete Country Error:', error);
      swalHelper.showToast('Failed to delete country', 'error');
      throw error;
    }
  }
}

// User response interface for pagination
export interface UserResponse {
  docs: any[];
  totalDocs: string | number;
  limit: number;
  page: number;
  totalPages: number;
}


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private headers: any = [];
  profileData: any;
  
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  

  async adminLogin(credentials: { email: string; password: string }): Promise<AdminLoginResponse> {
    try {
      this.headers = []; // No token needed for login
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.ADMIN_LOGIN,
          method: 'POST',
        },
        credentials,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Admin Login Error:', error);
      swalHelper.showToast('Failed to login', 'error');
      throw error;
    }
  }

  getImageUrl(): string {
    return environment.imageUrl;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.storage.get(common.TOKEN);
  }

  // Logout user
  logout(): void {
  
    
    window.location.href = '/login'; // Redirect to login page
  }

  // User Management Methods
  async getUsers(data: { page: number; limit: number; search: string }): Promise<any> {
    try {
      this.getHeaders();
      console.log("data",data);
      // Create query parameters
      let queryParams = `?page=${data.page}&limit=${data.limit}`;
      if (data.search) {
        queryParams += `&search=${encodeURIComponent(data.search)}`;
      }
      
      console.log('Sending Request with params:', queryParams);
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_USERS + queryParams,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      console.log('API Response: for auth service', response);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      swalHelper.showToast('Failed to fetch users', 'error');
      throw error;
    }
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<any> {
    try {
      this.getHeaders();
      
      const data = {
        userId: userId,
        isActive: isActive
      };
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_USER_STATUS,
          method: 'POST',
        },
        data,
        this.headers
      );
      
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to update user status', 'warning');
        return null;
      }
    } catch (error) {
      console.error('Update User Status Error:', error);
      swalHelper.showToast('Something went wrong!', 'error');
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_USER,
          method: 'POST',
        },
        { userId },
        this.headers
      );
      return response.data;
    } catch (error) {
      swalHelper.showToast('Failed to delete user', 'error');
      throw error;
    }
  }

  async getUserDetails(userId: string): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_USER_DETAILS}/${userId}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to fetch user details', 'warning');
        return null;
      }
    } catch (error) {
      console.error('Get User Details Error:', error);
      swalHelper.showToast('Failed to fetch user details', 'error');
      throw error;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private headers: any = [];
  
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getAllStates(data: { page: number; limit: number; search: string }): Promise<StateResponse> {
    try {
      this.getHeaders();
      
      // Create query parameters
      let queryParams = `?page=${data.page}&limit=${data.limit}`;
      if (data.search) {
        queryParams += `&search=${encodeURIComponent(data.search)}`;
      }
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_STATES + queryParams,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      // Return just the data part of the response
      return response.data || response;
    } catch (error) {
      console.error('API Error:', error);
      swalHelper.showToast('Failed to fetch states', 'error');
      throw error;
    }
  }

  async createState(data: { name: string; country_id: string; status: boolean }): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CREATE_STATE,
          method: 'POST',
        },
        data,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Create State Error:', error);
      swalHelper.showToast('Failed to create state', 'error');
      throw error;
    }
  }

  async updateState(id: string, data: { name: string; country_id: string; status: boolean }): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.UPDATE_STATE}/${id}`,
          method: 'PUT',
        },
        data,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Update State Error:', error);
      swalHelper.showToast('Failed to update state', 'error');
      throw error;
    }
  }

  async getStateById(id: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.GET_STATE_BY_ID}/${id}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Get State By ID Error:', error);
      swalHelper.showToast('Failed to fetch state details', 'error');
      throw error;
    }
  }

  async deleteState(id: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.DELETE_STATE}/${id}`,
          method: 'DELETE',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Delete State Error:', error);
      swalHelper.showToast('Failed to delete state', 'error');
      throw error;
    }
  }
}

export interface DashboardCounts {
  users: number;
  admins: number;
  asks: number;
  referrals: number;
  tyfcbs: number;
  oneToOnes: number;
  testimonials: number;
  testimonialReqs: number;
  banners: number;
  events: number;
}

export interface DashboardResponse {
  status: number;
  message: string;
  data: DashboardCounts;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);

    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getDashboardCounts(): Promise<DashboardResponse> {
    try {
      this.getHeaders();

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_DASHBOARD_COUNTS,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      

      return response;
      
    } catch (error) {
      console.error('Dashboard API Error:', error);
      swalHelper.showToast('Failed to fetch dashboard data', 'error');
      throw error;
    }
  }
}
export interface EventResponse {
  docs: Event[];
  totalDocs: string | number;
  limit: number;
  page: number;
  totalPages: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface Event {
  _id: string;
  name: string;
  event_or_meeting: 'event' | 'meeting';
  paid: boolean;
  date: string;
  thumbnail: string;
  location: string;
  chapter_name: string;
  createdAt: string;
  photos: string[];
  videos: string[];
  __v: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      if (token != null) {
          this.headers.push({ Authorization: `Bearer ${token}` });
      }
  };

  async getAllEvents(): Promise<Event[]> {
      try {
          this.getHeaders();
          const response = await this.apiManager.request(
              {
                  url: apiEndpoints.GET_ALL_EVENTS,
                  method: 'GET',
              },
              null,
              this.headers
          );
          return response.data || [];
      } catch (error) {
          console.error('API Error:', error);
          swalHelper.showToast('Failed to fetch events', 'error');
          throw error;
      }
  }

  async createEvent(formData: FormData): Promise<any> {
      try {
          this.getHeaders();
          const response = await this.apiManager.request(
              {
                  url: apiEndpoints.CREATE_EVENT,
                  method: 'POST',
                  isFormData: true,
              },
              formData,
              this.headers
          );
          return response;
      } catch (error) {
          console.error('Create Event Error:', error);
          swalHelper.showToast('Failed to create event', 'error');
          throw error;
      }
  }

  async updateEvent(eventId: string, formData: FormData): Promise<any> {
      try {
          this.getHeaders();
          const response = await this.apiManager.request(
              {
                 
                    url: `${apiEndpoints.UPDATE_EVENT}/${eventId}`,
                  method: 'PUT',
                  isFormData: true,
              },
              formData,
              this.headers
          );
          return response;
      } catch (error) {
          console.error('Update Event Error:', error);
          swalHelper.showToast('Failed to update event', 'error');
          throw error;
      }
  }

  async addPhotosToEvent(eventId: string, formData: FormData): Promise<any> {
      try {
          this.getHeaders();
          const response = await this.apiManager.request(
              {
                  url: `${apiEndpoints.ADD_PHOTOS_TO_EVENT}/${eventId}/photos`,
                  method: 'POST',
                  isFormData: true,
              },
              formData,
              this.headers
          );
          return response;
      } catch (error) {
          console.error('Add Photos Error:', error);
          swalHelper.showToast('Failed to add photos to event', 'error');
          throw error;
      }
  }

  async addVideosToEvent(eventId: string, formData: FormData): Promise<any> {
      try {
          this.getHeaders();
          const response = await this.apiManager.request(
              {
                  url: `${apiEndpoints.ADD_VIDEOS_TO_EVENT}/${eventId}/videos`,
                  method: 'POST',
                  isFormData: true,
              },
              formData,
              this.headers
          );
          return response;
      } catch (error) {
          console.error('Add Videos Error:', error);
          swalHelper.showToast('Failed to add videos to event', 'error');
          throw error;
      }
  }
}

  export interface AttendanceData {
    _id: string;
    createdAt: string;
    userData: {
      name: string;
      chapter_name: string;
    };
    eventData: {
      name: string;
      event_or_meeting: string;
      date: string;
    };
  }

 
  export interface AttendanceResponse {
    docs: AttendanceData[];
  }

  export interface Attendance {
    _id: string;
    createdAt: string;
    userData: {
      name: string;
      chapter_name: string;
    };
    eventData: {
      name: string;
      event_or_meeting: string;
      date: string;
    };
  }
  
  @Injectable({
    providedIn: 'root',
  })
  export class AttendanceService {
    private headers: any = [];
    
    constructor(private apiManager: ApiManager, private storage: AppStorage) {}
    
    private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      
      if (token != null) {
        this.headers.push({ Authorization: `Bearer ${token}` });
      }
    };
  
    async getAllAttendance(): Promise<AttendanceResponse> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.GET_ALL_ATTENDANCE,
            method: 'GET',
          },
          null,
          this.headers
        );
        
        return response.data;
      } catch (error) {
        console.error('API Error:', error);
        swalHelper.showToast('Failed to fetch attendance records', 'error');
        throw error;
      }
    }
  
    async deleteAttendance(attendanceId: string): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.DELETE_ATTENDANCE}/${attendanceId}`,
            method: 'DELETE',
          },
          null,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('Delete Attendance Error:', error);
        swalHelper.showToast('Failed to delete attendance record', 'error');
        throw error;
      }
    }
  }
    
  export interface ChapterResponse {
    docs: Chapter[];
    totalDocs: string | number;
    limit: number;
    page: number;
    totalPages: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  }
  
  export interface Chapter {
    _id: string;
    name: string;
    city_id?: string;
    city_name?: string;
    status: boolean;
    createdAt: string;
    __v: number;
  }
  
  @Injectable({
    providedIn: 'root',
  })
  export class ChapterService {
    private headers: any = [];
    
    constructor(private apiManager: ApiManager, private storage: AppStorage) {}
    
    private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      
      if (token != null) {
        this.headers.push({ Authorization: `Bearer ${token}` });
      }
    };
  
    async getAllChapters(data: { page: number; limit: number; search: string }): Promise<ChapterResponse> {
      try {
        this.getHeaders();
        
        // Create query parameters
        let queryParams = `?page=${data.page}&limit=${data.limit}`;
        if (data.search) {
          queryParams += `&search=${encodeURIComponent(data.search)}`;
        }
        
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.GET_ALL_CHAPTERS + queryParams,
            method: 'GET',
          },
          null,
          this.headers
        );
        
        // Return the data part of the response
        return response.data || response;
      } catch (error) {
        console.error('API Error:', error);
        swalHelper.showToast('Failed to fetch chapters', 'error');
        throw error;
      }
    }
    async getAllChaptersForDropdown(): Promise<Chapter[]> {
      try {
        this.getHeaders();
  
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.GET_ALL_CHAPTERS + '?limit=1000', // High limit to get all chapters
            method: 'GET',
          },
          null,
          this.headers
        );
  
        return response.data?.docs || [];
      } catch (error) {
        console.error('API Error:', error);
        swalHelper.showToast('Failed to fetch chapters for dropdown', 'error');
        throw error;
      }
    }
  
    async createChapter(data: { name: string; city_id?: string; city_name?: string; status: boolean }): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.CREATE_CHAPTER,
            method: 'POST',
          },
          data,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('Create Chapter Error:', error);
        swalHelper.showToast('Failed to create chapter', 'error');
        throw error;
      }
    }
  
    async updateChapter(id: string, data: { name: string; city_id?: string; city_name?: string; status: boolean }): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.UPDATE_CHAPTER}/${id}`,
            
             method: 'PUT',
          },
          data,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('Update Chapter Error:', error);
        swalHelper.showToast('Failed to update chapter', 'error');
        throw error;
      }
    }
  
    async getChapterById(id: string): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.GET_CHAPTER_BY_ID.replace(':id', id),
            method: 'GET',
          },
          null,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('Get Chapter By ID Error:', error);
        swalHelper.showToast('Failed to fetch chapter details', 'error');
        throw error;
      }
    }
  
    async deleteChapter(id: string): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.DELETE_CHAPTER}/${id}`,
            method: 'DELETE',
          },
          null,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('Delete Chapter Error:', error);
        swalHelper.showToast('Failed to delete chapter', 'error');
        throw error;
      }
    }
  }

  export interface CategoryResponse {
    docs: Category[];
    totalDocs: string | number;
    limit: number;
    page: number;
    totalPages: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  }
  
  export interface Category {
    _id: string;
    name: string;
    status: boolean;
    createdAt: string;
    __v: number;
  }
  
  @Injectable({
    providedIn: 'root',
  })
  export class CategoryService {
    private headers: any = [];
    
    constructor(private apiManager: ApiManager, private storage: AppStorage) {}
    
    private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      
      if (token != null) {
        this.headers.push({ Authorization: `Bearer ${token}` });
      }
    };
  
    async getCategories(data: { page: number; limit: number; search: string }): Promise<CategoryResponse> {
      try {
        this.getHeaders();
        
        // Create query parameters
        let queryParams = `?page=${data.page}&limit=${data.limit}`;
        if (data.search) {
          queryParams += `&search=${encodeURIComponent(data.search)}`;
        }
        
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.GET_CATEGORIES + queryParams,
            method: 'GET',
          },
          null,
          this.headers
        );
        
        // Return just the data part of the response, which should match CategoryResponse
        return response.data || response;
      } catch (error) {
        console.error('API Error:', error);
        swalHelper.showToast('Failed to fetch categories', 'error');
        throw error;
      }
    }
  
    async createCategory(data: { name: string; status: boolean }): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.CREATE_CATEGORY,
            method: 'POST',
          },
          data,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('Create Category Error:', error);
        swalHelper.showToast('Failed to create category', 'error');
        throw error;
      }
    }
  
    async updateCategory(id: string, data: { name: string; status: boolean }): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.UPDATE_CATEGORY}/${id}`,
            method: 'PUT',
          },
          data,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('Update Category Error:', error);
        swalHelper.showToast('Failed to update category', 'error');
        throw error;
      }
    }
  
    async getCategoryById(id: string): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.GET_CATEGORY_BY_ID}/${id}`,
            method: 'GET',
          },
          null,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('Get Category By ID Error:', error);
        swalHelper.showToast('Failed to fetch category details', 'error');
        throw error;
      }
    }
  
    async deleteCategory(id: string): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.DELETE_CATEGORY}/${id}`,
            method: 'DELETE',
          },
          null,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('Delete Category Error:', error);
        swalHelper.showToast('Failed to delete category', 'error');
        throw error;
      }
    }}
    export interface CityResponse {
      docs: City[];
      totalDocs: string | number;
      limit: number;
      page: number;
      totalPages: number;
      pagingCounter: number;
      hasPrevPage: boolean;
      hasNextPage: boolean;
      prevPage: number | null;
      nextPage: number | null;
    }
    
    export interface City {
      _id: string;
      name: string;
      state_id: string;
      state_name?: string;
      status: boolean;
      createdAt: string;
      __v: number;
    }
    
    @Injectable({
      providedIn: 'root',
    })
    export class CityService {
      private headers: any = [];
      
      constructor(private apiManager: ApiManager, private storage: AppStorage) {}
      
      private getHeaders = () => {
        this.headers = [];
        let token = this.storage.get(common.TOKEN);
        
        if (token != null) {
          this.headers.push({ Authorization: `Bearer ${token}` });
        }
      };
    
      async getAllCities(data: { page: number; limit: number; search: string }): Promise<CityResponse> {
        try {
          this.getHeaders();
          
          // Create query parameters
          let queryParams = `?page=${data.page}&limit=${data.limit}`;
          if (data.search) {
            queryParams += `&search=${encodeURIComponent(data.search)}`;
          }
          
          const response = await this.apiManager.request(
            {
              url: apiEndpoints.GET_ALL_CITIES + queryParams,
              method: 'GET',
            },
            null,
            this.headers
          );
          
          // Return just the data part of the response
          return response.data || response;
        } catch (error) {
          console.error('API Error:', error);
          swalHelper.showToast('Failed to fetch cities', 'error');
          throw error;
        }
      }
    
      async createCity(data: { name: string; state_id: string; status: boolean }): Promise<any> {
        try {
          this.getHeaders();
          
          const response = await this.apiManager.request(
            {
              url: apiEndpoints.CREATE_CITY,
              method: 'POST',
            },
            data,
            this.headers
          );
          
          return response;
        } catch (error) {
          console.error('Create City Error:', error);
          swalHelper.showToast('Failed to create city', 'error');
          throw error;
        }
      }
    
      async updateCity(id: string, data: { name: string; state_id: string; status: boolean }): Promise<any> {
        try {
          this.getHeaders();
          
          const response = await this.apiManager.request(
            {
              url: `${apiEndpoints.UPDATE_CITY}/${id}`,
              method: 'PUT',
            },
            data,
            this.headers
          );
          
          return response;
        } catch (error) {
          console.error('Update City Error:', error);
          swalHelper.showToast('Failed to update city', 'error');
          throw error;
        }
      }
    
      async getCityById(id: string): Promise<any> {
        try {
          this.getHeaders();
          
          const response = await this.apiManager.request(
            {
              url: `${apiEndpoints.GET_CITY_BY_ID}/${id}`,
              method: 'GET',
            },
            null,
            this.headers
          );
          
          return response;
        } catch (error) {
          console.error('Get City By ID Error:', error);
          swalHelper.showToast('Failed to fetch city details', 'error');
          throw error;
        }
      }
    
      async deleteCity(id: string): Promise<any> {
        try {
          this.getHeaders();
          
          const response = await this.apiManager.request(
            {
              url: `${apiEndpoints.DELETE_CITY}/${id}`,
              method: 'DELETE',
            },
            null,
            this.headers
          );
          
          return response;
        } catch (error) {
          console.error('Delete City Error:', error);
          swalHelper.showToast('Failed to delete city', 'error');
          throw error;
        }}}
      
        export interface LeaderboardResponse {
          docs: LeaderboardPoint[];
          totalDocs: string | number;
          limit: number;
          page: number;
          totalPages: number;
          pagingCounter: number;
          hasPrevPage: boolean;
          hasNextPage: boolean;
          prevPage: number | null;
          nextPage: number | null;
        }
        
        export interface LeaderboardPoint {
          _id: string;
          name: string;
          point: number;
          month_count?: number;
          amount_limit?: number;
          from_date?: string;
          to_date?: string;
          createdAt?: string;
          __v?: number;
          isDeleted?: boolean;
        }
        @Injectable({
          providedIn: 'root',
        }) 
        export class LeaderboardService {
          private headers: any = [];
          
          constructor(private apiManager: ApiManager, private storage: AppStorage) {}
          
          private getHeaders = () => {
            this.headers = [];
            let token = this.storage.get(common.TOKEN);
            
            if (token != null) {
              this.headers.push({ Authorization: `Bearer ${token}` });
            }
          };
        
          async getAllLeaderboards(data: { page: number; limit: number; search: string }): Promise<LeaderboardResponse> {
            try {
              this.getHeaders();
              
              // Create query parameters
              let queryParams = `?page=${data.page}&limit=${data.limit}`;
              if (data.search) {
                queryParams += `&search=${encodeURIComponent(data.search)}`;
              }
              
              const response = await this.apiManager.request(
                {
                  url: apiEndpoints.GET_ALL_LEADERBOARDS + queryParams,
                  method: 'GET',
                },
                null,
                this.headers
              );
              
              // Return just the data part of the response, which should match LeaderboardResponse
              return response.data || response;
            } catch (error) {
              console.error('API Error:', error);
              swalHelper.showToast('Failed to fetch leaderboard points', 'error');
              throw error;
            }
          }
        
            
          async updateLeaderboard(id: string, data: any): Promise<any> {
            try {
              this.getHeaders();
              
              const response = await this.apiManager.request(
                {
                  url: `${apiEndpoints.UPDATE_LEADERBOARD}/${id}`,
                  method: 'PUT',
                },
                data,
                this.headers
              );
              
              return response;
            } catch (error) {
              console.error('Update Leaderboard Point Error:', error);
              swalHelper.showToast('Failed to update leaderboard point', 'error');
              throw error;
            }
          }
        
          async getLeaderboardById(id: string): Promise<any> {
            try {
              this.getHeaders();
              
              const response = await this.apiManager.request(
                {
                  url: `${apiEndpoints.GET_LEADERBOARD_BY_ID}/${id}`,
                  method: 'GET',
                },
                null,
                this.headers
              );
              
              return response;
            } catch (error) {
              console.error('Get Leaderboard By ID Error:', error);
              swalHelper.showToast('Failed to fetch leaderboard point details', 'error');
              throw error;
            }
          }
        
          async deleteLeaderboard(id: string): Promise<any> {
            try {
              this.getHeaders();
              
              const response = await this.apiManager.request(
                {
                  url: `${apiEndpoints.DELETE_LEADERBOARD}/${id}`,
                  method: 'DELETE',
                },
                null,
                this.headers
              );
              
              return response;
            } catch (error) {
              console.error('Delete Leaderboard Error:', error);
              swalHelper.showToast('Failed to delete leaderboard point', 'error');
              throw error;
            }
          }
          
          async createLeaderboard(data: any): Promise<any> {
            try {
              this.getHeaders();
              
              const response = await this.apiManager.request(
                {
                  url: apiEndpoints.CREATE_LEADERBOARD,
                  method: 'POST',
                },
                data,
                this.headers
              );
              
              return response;
            } catch (error) {
              console.error('Create Leaderboard Error:', error);
              swalHelper.showToast('Failed to create leaderboard point', 'error');
              throw error;
            }
          }
        }
          export interface ReferralStatus {
            told_them_you_would_will: boolean;
            given_card: boolean;
          }
          
          export interface User {
            _id: string;
            name: string;
            chapter_name: string;
            profilePic: string;
          }
          
          export interface Referral {
            _id: string;
            referral_status: ReferralStatus;
            giver_id: User;
            receiver_id: User | null;
            referral_type: string;
            referral: string;
            mobile_number: string;
            address: string;
            comments: string;
            rating: number;
            createdAt: string;
            __v: number;
          }
          
          export interface ReferralResponse {
            docs: Referral[];
            totalDocs: number;
            limit: number;
            page: number;
            totalPages: number;
            pagingCounter: number;
            hasPrevPage: boolean;
            hasNextPage: boolean;
            prevPage: number | null;
            nextPage: number | null;
          }
          
          @Injectable({
            providedIn: 'root',
          })
          export class ReferralService {
            private headers: any = [];
            
            constructor(private apiManager: ApiManager, private storage: AppStorage) {}
            
            private getHeaders = () => {
              this.headers = [];
              let token = this.storage.get(common.TOKEN);
              
              if (token != null) {
                this.headers.push({ Authorization: `Bearer ${token}` });
              }
            };
          
            async getAllReferrals(params: any): Promise<ReferralResponse> {
              try {
                this.getHeaders();
                
                // Build query string
                const queryParams = Object.keys(params)
                  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                  .join('&');
                
                const url = `${apiEndpoints.GET_ALL_REFERRALS}?${queryParams}`;
                
                const response = await this.apiManager.request(
                  {
                    url: url,
                    method: 'GET',
                  },
                  null,
                  this.headers
                );
                
                return response.data || response;
              } catch (error) {
                console.error('API Error:', error);
                swalHelper.showToast('Failed to fetch referrals', 'error');
                throw error;
              }
            }}
          
            export interface User {
              _id: string;
              name: string;
              chapter_name: string;
              profilePic: string;
            }
            
            export interface Testimonial {
              _id: string;
              giverId: User;
              receiverId: User | null;
              date: string | null;
              message: string;
              selected: boolean;
              createdAt: string;
              __v: number;
            }
            
            export interface TestimonialResponse {
              docs: Testimonial[];
              totalDocs: number;
              limit: number;
              page: number;
              totalPages: number;
              hasPrevPage: boolean;
              hasNextPage: boolean;
              prevPage: number | null;
              nextPage: number | null;
            }
            
            @Injectable({
              providedIn: 'root',
            })
            export class TestimonialService {
              private headers: any = [];
              
              constructor(private apiManager: ApiManager, private storage: AppStorage) {}
              
              private getHeaders = () => {
                this.headers = [];
                let token = this.storage.get(common.TOKEN);
                
                if (token != null) {
                  this.headers.push({ Authorization: `Bearer ${token}` });
                }
              };
            
              async getAllTestimonials(params: any): Promise<TestimonialResponse> {
                try {
                  this.getHeaders();
                  
                  // Build query string
                  const queryParams = Object.keys(params)
                    .filter(key => params[key] !== undefined && params[key] !== null)
                    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                    .join('&');
                  
                  const url = `${apiEndpoints.GET_ALL_TESTIMONIALS}?${queryParams}`;
                  
                  const response = await this.apiManager.request(
                    {
                      url: url,
                      method: 'GET',
                    },
                    null,
                    this.headers
                  );
                  
                  return response.data || response;
                } catch (error) {
                  console.error('API Error:', error);
                  swalHelper.showToast('Failed to fetch testimonials', 'error');
                  throw error;
                }
              }
            }

              export interface ReferralStatus {
                told_them_you_would_will: boolean;
                given_card: boolean;
              }
              
              export interface User {
                _id: string;
                name: string;
                chapter_name: string;
                profilePic: string;
              }
              
              export interface Referral {
                _id: string;
                referral_status: ReferralStatus;
                giver_id: User;
                receiver_id: User | null;
                referral_type: string;
                referral: string;
                mobile_number: string;
                address: string;
                comments: string;
                rating: number;
                createdAt: string;
                __v: number;
              }
              
              export interface ReferralResponse {
                docs: Referral[];
                totalDocs: number;
                limit: number;
                page: number;
                totalPages: number;
                pagingCounter: number;
                hasPrevPage: boolean;
                hasNextPage: boolean;
                prevPage: number | null;
                nextPage: number | null;
              }
              
              @Injectable({
                providedIn: 'root',
              })
              export class ReferralServiceRecieved{
                private headers: any = [];
                
                constructor(private apiManager: ApiManager, private storage: AppStorage) {}
                
                private getHeaders = () => {
                  this.headers = [];
                  let token = this.storage.get(common.TOKEN);
                  
                  if (token != null) {
                    this.headers.push({ Authorization: `Bearer ${token}` });
                  }
                };
              
                async getAllReferrals(params: any): Promise<ReferralResponse> {
                  try {
                    this.getHeaders();
                    
                    // Build query string
                    const queryParams = Object.keys(params)
                      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                      .join('&');
                    
                    const url = `${apiEndpoints.GET_ALL_REFERRALS_RECIEVED}?${queryParams}`;
                    
                    const response = await this.apiManager.request(
                      {
                        url: url,
                        method: 'GET',
                      },
                      null,
                      this.headers
                    );
                    
                    return response.data || response;
                  } catch (error) {
                    console.error('API Error:', error);
                    swalHelper.showToast('Failed to fetch referrals', 'error');
                    throw error;
                  }
                }
              }
              
export interface User {
  _id: string;
  name: string;
  chapter_name: string;
  profilePic: string;
}

export interface OneToOne {
  _id: string;
  memberId1: User;
  memberId2: User;
  meet_place: string;
  initiatedBy: User;
  date: string;
  topics: string;
  createdAt: string;
  __v: number;
}

export interface OneToOneResponse {
  docs: OneToOne[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class OneToOneService {
  private headers: any = [];
  
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getAllOneToOne(params: any): Promise<OneToOneResponse> {
    try {
      this.getHeaders();
      
      // Build query string
      const queryParams = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const url = `${apiEndpoints.GET_ALL_ONE_TO_ONE}?${queryParams}`;
      
      const response = await this.apiManager.request(
        {
          url: url,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('API Error:', error);
      swalHelper.showToast('Failed to fetch One-to-One meetings', 'error');
      throw error;
    }
  }}
  
export interface User {
  _id: string;
  name: string;
  chapter_name: string;
  profilePic: string;
}

export interface Tyfcb {
  _id: string;
  giverId: User;
  receiverId: User;
  referralId: any;
  amount: number;
  currency: string;
  referral_type: string;
  business_type: string;
  comments: string;
  createdAt: string;
  __v: number;
}

export interface TyfcbResponse {
  docs: Tyfcb[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class TyfcbService {
  private headers: any = [];
  
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getAllTyfcbs(params: any): Promise<TyfcbResponse> {
    try {
      this.getHeaders();
      
      // Build query string
      const queryParams = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const url = `${apiEndpoints.GET_ALL_TYFCBS}?${queryParams}`;
      
      const response = await this.apiManager.request(
        {
          url: url,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('API Error:', error);
      swalHelper.showToast('Failed to fetch TYFCB records', 'error');
      throw error;
    }
  }}
  export interface User {
  _id: string;
  name: string;
  chapter_name: string;
  profilePic: string;
}

export interface Event1 {
  _id: string;
  name: string;
  event_or_meeting: string;
  date: string;
  paid: boolean;
  thumbnail: string;
  photos: string[];
  videos: string[];
  createdAt: string;
  __v: number;
}

export interface Visitor {
  _id: string;
  name: string;
  refUserId: User;
  eventId: Event;
  mobile_number: string;
  email: string;
  business_name: string;
  business_type: string;
  address: string;
  pincode: string;
  fees: number | null;
  paid: boolean;
  createdAt: string;
  __v: number;
}

export interface VisitorResponse {
  docs: Visitor[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class VisitorService {
  private headers: any = [];
  
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getAllVisitors(params: any): Promise<VisitorResponse> {
    try {
      this.getHeaders();
      
      // Build query string
      const queryParams = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      const url = `${apiEndpoints.GET_ALL_VISITORS}?${queryParams}`;
      
      const response = await this.apiManager.request(
        {
          url: url,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('API Error:', error);
      swalHelper.showToast('Failed to fetch visitors', 'error');
      throw error;
    }
  }
  async updateVisitor(visitorId: string, data: any): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.UPDATE_VISITOR}/${visitorId}`,
          method: 'PUT',
        },
        data,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Update Visitor Error:', error);
      swalHelper.showToast('Failed to update visitor', 'error');
      throw error;
    }
  }}
  
  export interface UserData {
    name: string;
    chapter_name: string;
    profilePic?: string;
  }
  
  export interface EventData {
    name: string;
    event_or_meeting: string;
    date: string;
  }
  
  export interface AttendanceRecord {
    _id: string;
    userData: UserData;
    eventData: EventData;
    createdAt: string;
  }
  
  export interface AttendanceReportResponse {
    docs: AttendanceRecord[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  }
  
  @Injectable({
    providedIn: 'root',
  })
  export class AttendanceReportService {
    private headers: any = [];
    
    constructor(private apiManager: ApiManager, private storage: AppStorage) {}
    
    private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      
      if (token != null) {
        this.headers.push({ Authorization: `Bearer ${token}` });
      }
    };
  
    async getAllAttendance(params: any): Promise<AttendanceReportResponse> {
      try {
        this.getHeaders();
        
        // Build query string
        const queryParams = Object.keys(params)
          .filter(key => params[key] !== undefined && params[key] !== null)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
          .join('&');
        
        const url = `${apiEndpoints.GET_ALL_ATTENDANCE}?${queryParams}`;
        
        const response = await this.apiManager.request(
          {
            url: url,
            method: 'GET',
          },
          null,
          this.headers
        );
        
        return response.data || response;
      } catch (error) {
        console.error('API Error:', error);
        swalHelper.showToast('Failed to fetch attendance records', 'error');
        throw error;
      }
    }
  }
  @Injectable({
    providedIn: 'root',
  })
  export class ReferralService1 {
    private headers: any = [];
  
    constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
    private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      
      if (token != null) {
        this.headers.push({ Authorization: `Bearer ${token}` });
      }
    };
  
    async getReferralsGiven(userId: string, payload: { page: number; limit: number }): Promise<any> {
      try {
        this.getHeaders();
        const queryParams = `?page=${payload.page}&limit=${payload.limit}`;
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.REFERRAL_GIVEN}/${userId}${queryParams}`,
             
      
            method: 'GET',
          },
          null,
          this.headers
        );
        
        if (response && response.status === 200) {
          return response;
        } else {
          swalHelper.showToast(response.message || 'Failed to fetch referrals given', 'warning');
          return null;
        }
      } catch (error) {
        console.error('Get Referrals Given Error:', error);
        swalHelper.showToast('Failed to fetch referrals given', 'error');
        throw error;
      }
    }
  
    async getReferralsReceived(userId: string, payload: { page: number; limit: number }): Promise<any> {
      try {
        this.getHeaders();
        const queryParams = `?page=${payload.page}&limit=${payload.limit}`;
        
        const response = await this.apiManager.request(
          {
           
            url: `${apiEndpoints.REFERRAL_RECEIVED}/${userId}${queryParams}`,
            method: 'GET',
          },
          null,
          this.headers
        );
        
        if (response && response.status === 200) {
          return response;
        } else {
          swalHelper.showToast(response.message || 'Failed to fetch referrals received', 'warning');
          return null;
        }
      } catch (error) {
        console.error('Get Referrals Received Error:', error);
        swalHelper.showToast('Failed to fetch referrals received', 'error');
        throw error;
      }
    }}
    export interface User {
      _id: string;
      name: string;
      email: string;
      mobile_number: string;
      chapter_name: string;
      meeting_role: string;
      profilePic: string;
      date_of_birth: string;
      city: string;
      state: string;
      country: string;
      sponseredBy: string;
      status: boolean;
      createdAt: string;
      keywords: string;
    }
    
    @Injectable({
      providedIn: 'root'
    })
    export class RegisterUserAuthService {
      private headers: any = [];
    
      constructor(
        private apiManager: ApiManager,
        private storage: AppStorage
      ) {}
    
      private getHeaders = () => {
        this.headers = [];
        let token = this.storage.get(common.TOKEN);
        if (token != null) {
          this.headers.push({ Authorization: `Bearer ${token}` });
        }
      };
    
      async registerUser(formData: FormData): Promise<any> {
        try {
          this.getHeaders();
          
          const response = await this.apiManager.request(
            {
              url: `${apiEndpoints.REGISTER_USER}`,
             
              method: 'POST'
            },
            formData,
            this.headers
          );
          
          return response;
        } catch (error) {
          console.error('Register User Error:', error);
          swalHelper.showToast('Failed to register user', 'error');
          throw error;
        }
      }
    }

    export interface PointHistory {
      userId: string;
      name: string;
      chapter_name: string;
      profilePic?: string;
      leaderboardPoints: {
        attendance_regular: number;
        tyfcb: number;
        one_to_one: number;
        event_attendance: number;
        referal: number;
        induction: number;
        visitor: number;
      };
      totalPointsSum: number;
    }
    
    export interface PointHistoryResponse {
      docs: PointHistory[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
      hasPrevPage: boolean;
      hasNextPage: boolean;
      prevPage: number | null;
      nextPage: number | null;
    }
    
    @Injectable({
      providedIn: 'root'
    })
    export class PointHistoryService {
      private headers: any = [];
    
      constructor(private apiManager: ApiManager, private storage: AppStorage) {}
    
      private getHeaders = () => {
        this.headers = [];
        let token = this.storage.get(common.TOKEN);
        if (token != null) {
          this.headers.push({ Authorization: `Bearer ${token}` });
        }
      };
    
      async getPointHistory(params: any): Promise<PointHistoryResponse> {
        try {
          this.getHeaders();
    
          const queryParams = Object.keys(params)
            .filter(key => params[key] !== undefined && params[key] !== null)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    
          const url = `${apiEndpoints.GET_POINT_HISTORY}?${queryParams}`;
    
          const response = await this.apiManager.request(
            {
              url: url,
              method: 'GET'
            },
            null,
            this.headers
          );
    
          return response.data || response;
        } catch (error) {
          console.error('API Error:', error);
          swalHelper.showToast('Failed to fetch point history', 'error');
          throw error;
        }
      }}

