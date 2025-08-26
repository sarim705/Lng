
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
  message:string;
  admin: {
    _id: string;
    name: string;
    email: string;
    password: string;
    createdAt: string;
    __v: number;
  };
}



export interface Chapter {
  _id: string;
  name: string;
  city_id?: string;
  city_name: string;
  RegisterationFee: number;
  
  status: boolean;
  createdAt: string;
  __v: number;
}

export interface ChapterResponse1 {
  status: number;
  message: string;
  data: Chapter[];
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
  country_id?: string;
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

export interface Ask {
  _id: string;
  product: string;
  businessCategory: string;
  businessSubCategory: string;
  description: string;
  timeDuration: string;
  status: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    chapter_name: string;
    mobile_number: string;
    email: string;
    profilePic: string;
  };
  leads: any[];
  businessGiven: Array<{
    partnerId: string;
    amount: number;
    givenAt: string;
    partnerDetails: {
      _id: string;
      name: string;
      chapter_name: string;
      mobile_number: string;
    };
  }>;
}

export interface AskResponse {
  docs: Ask[];
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


export interface Complaint {
  _id: string;
  userId: {
    _id: string;
    name: string;
    chapter_name: string;
    email: string;
  };
  title: string;
  details: string;
  image: string;
  status: string;
  category: string;
  adminResponse: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ComplaintResponse {
  docs: Complaint[];
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
    } catch (error: any) {
      console.error('Admin Login Error:', error);
      // Extract the error message from the API response if available
      const errorMessage = error.response?.data?.message || 'Failed to login';
      swalHelper.showToast(errorMessage, 'error');
      throw new Error(errorMessage); // Throw the specific error message
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

  async sendNotification(data: { userId: string; title: string; description: string; message: string }): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.SEND_NOTIFICATION_T0_USER,
          method: 'POST',
        },
        data,
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Send Notification Error:', error);
      swalHelper.showToast('Failed to send notification', 'error');
      throw error;
    }
  }

  // User Management Methods
  async getUsers(data: { page: number; limit: number; search: string; chapter?: string }): Promise<any> {
    try {
      this.getHeaders();
      console.log("data", data);
      // Create query parameters
      let queryParams = `?page=${data.page}&limit=${data.limit}`;
      if (data.search) {
        queryParams += `&search=${encodeURIComponent(data.search)}`;
      }
      if (data.chapter) {
        queryParams += `&chapter=${encodeURIComponent(data.chapter)}`;
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

async updateUser(userId: string, data: { name: string; mobile_number: string; email: string; meeting_role: string }): Promise<any> {
  try {
    this.getHeaders();
    const response = await this.apiManager.request(
      {
        url: `${apiEndpoints.UPDATE_USER}/${userId}`,
        method: 'PUT',
      },
      data,
      this.headers
    );
    return response;
  } catch (error) {
    console.error('Update User Error:', error);
    swalHelper.showToast('Failed to update user', 'error');
    throw error;
  }
}

  async getAllAsksForAdmin(data: { page: number; limit: number; search: string; chapter_name?: string | null }): Promise<AskResponse> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_ASK,
          method: 'POST',
        },
        data,
        this.headers
      );
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      swalHelper.showToast('Failed to fetch asks', 'error');
      throw error;
    }
  }


  async toggleUserStatus(data: { id: string }): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_USER_STATUS,
          method: 'POST',
        },
        data,
        this.headers
      );
      
      if (response.status === 200 )
         {

          console.log('Toggle User Status Response:', response.data);
        return response;
      } else {
        swalHelper.showToast(response.message || 'Failed to update user status', 'warning');
        return null;
      }
    } catch (error) {
      console.error('Toggle User Status Error:', error);
      swalHelper.showToast('Something went wrong!', 'error');
      throw error;
    }
  }
  
  
  async deleteUser(userId: string): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.DELETE_USER}/${userId}`,
          method: 'DELETE',
        },
        null,
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Delete User Error:', error);
      swalHelper.showToast('Failed to delete user', 'error');
      throw error;
    }
  }
  async uploadExcelFile(formData: FormData): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.IMPORT_USERS,
          method: 'POST',
        },
        formData,
        this.headers
      );
      return response;
    } catch (error: any) {
      console.error('Upload Excel File Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload file';
      swalHelper.showToast(errorMessage, 'error');
      throw new Error(errorMessage);
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
export class ComplaintService {
  private headers: any = [];
  
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getComplaints(data: { page: number; limit: number; search: string }): Promise<ComplaintResponse> {
    try {
      this.getHeaders();
      
      let queryParams = `?page=${data.page}&limit=${data.limit}`;
      if (data.search) {
        queryParams += `&search=${encodeURIComponent(data.search)}`;
      }
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_COMPLAINTS + queryParams,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Get Complaints Error:', error);
      swalHelper.showToast('Failed to fetch complaints', 'error');
      throw error;
    }
  }

  async updateComplaintStatus(id: string, data: { adminResponse: string; status: string }): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.UPDATE_COMPLAINT_STATUS}/${id}`,
          method: 'PUT',
        },
        data,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Update Complaint Status Error:', error);
      swalHelper.showToast('Failed to update complaint status', 'error');
      throw error;
    }
  }
}

export interface Suggestion {
  _id: string;
  userId: {
    _id: string;
    name: string;
    chapter_name: string;
    email: string;
  };
  title: string;
  details: string;
  category: string;
  status: string;
  adminResponse: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SuggestionResponse {
  docs: Suggestion[];
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
export class SuggestionService {
  private headers: any = [];
  
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getSuggestions(data: { page: number; limit: number; search: string }): Promise<SuggestionResponse> {
    try {
      this.getHeaders();
      
      let queryParams = `?page=${data.page}&limit=${data.limit}`;
      if (data.search) {
        queryParams += `&search=${encodeURIComponent(data.search)}`;
      }
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_SUGGESTION + queryParams,
          method: 'GET',
        },
        null,
        this.headers
      );
      //getSuggestions updateSuggestionStatus
      return response.data || response;
    } catch (error) {
      console.error('Get Suggestions Error:', error);
      swalHelper.showToast('Failed to fetch suggestions', 'error');
      throw error;
    }
  }

  async updateSuggestionStatus(id: string, data: { adminResponse: string; status: string }): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
 
          url: `${apiEndpoints.UPDATE_SUGGESTION_STATUS}/${id}`,
          method: 'PUT',
        },
        data,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('Update Suggestion Status Error:', error);
      swalHelper.showToast('Failed to update suggestion status', 'error');
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
  

    async createState(data: { name: string; country_name: string; status: boolean }): Promise<any> {
      try {
        this.getHeaders();
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.CREATE_STATE,
            method: 'POST',
          },
          { name: data.name, country_name: data.country_name, status: data.status },
          this.headers
        );
        return response;
      } catch (error) {
        console.error('Create State Error:', error);
        swalHelper.showToast('Failed to create state', 'error');
        throw error;
      }
    }
  
    async updateState(id: string, data: { name: string; country_name: string; status: boolean }): Promise<any> {
      try {
        this.getHeaders();
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.UPDATE_STATE}/${id}`,
            method: 'PUT',
          },
          { name: data.name, country_name: data.country_name, status: data.status },
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
  referrals: {
    given: number;
    received: number;
    total: number;
  };
  tyfcbs: {
    given: number;
    received: number;
    total: number;
  };
  oneToOnes: {
    initiated: number;
    participated: number;
    total: number;
  };
  testimonials: {
    given: number;
    received: number;
    total: number;
  };
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

  constructor(
    private apiManager: ApiManager,
    private storage: AppStorage,
    private cityService: CityService
  ) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getDashboardCounts(filters: {
    city?: string;
    chapter?: string;
    fromDate?: string;
    toDate?: string;
  } = {}): Promise<DashboardResponse> {
    try {
      this.getHeaders();
      const queryParams = new URLSearchParams();
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.chapter) queryParams.append('chapter', filters.chapter);
      if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
      if (filters.toDate) queryParams.append('toDate', filters.toDate);

      const url = `${apiEndpoints.GET_DASHBOARD_COUNTS}?${queryParams.toString()}`;

      const response = await this.apiManager.request(
        {
          url,
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


  async getChaptersByCity(cityName: string): Promise<ChapterResponse1> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_CHAPTER_BY_CITY,
          method: 'POST',
        },
        { city_name: cityName },
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Get Chapters By City Error:', error);
      swalHelper.showToast('Failed to fetch chapters', 'error');
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
    amount: number;
    date: string;
    startTime: string;
    endTime: string;
    mode: 'online' | 'offline';
    thumbnail: string;
    location: string;
    chapter_name: string;
    details: string;
    mapURL: string;
    createdAt: string;
    photos: string[];
    videos: string[];
    __v: number;
}
export interface Chapter {
    name: string;
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
                    url: `${apiEndpoints.GET_ALL_EVENTS}?t=${new Date().getTime()}`, // Cache-busting
                    method: 'GET',
                },
                null,
                this.headers
            );
            console.log('getAllEvents Response:', JSON.stringify(response, null, 2)); // Debug: Log full response
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
          // Append eventId to FormData
          formData.append('eventId', eventId);
          const response = await this.apiManager.request(
              {
                  url: apiEndpoints.UPDATE_EVENT, // Now points to /updateEvent
                  method: 'POST', // Changed to POST
                  isFormData: true,
              },
              formData,
              this.headers
          );
          console.log('updateEvent Response:', JSON.stringify(response, null, 2));
          return response;
      } catch (error) {
          console.error('Update Event Error:', error);
          swalHelper.showToast('Failed to update event', 'error');
          throw error;
      }
  }
    async deleteEvent(eventId: string): Promise<any> {
        try {
            this.getHeaders();
            const response = await this.apiManager.request(
                {
                    url: `${apiEndpoints.DELETE_EVENT}/${eventId}`,
                    method: 'DELETE',
                },
                null,
                this.headers
            );
            return response;
        } catch (error) {
            console.error('Delete Event Error:', error);
            swalHelper.showToast('Failed to delete event', 'error');
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

    async getEventGallery(eventId: string): Promise<any> {
      try {
          this.getHeaders();
          const response = await this.apiManager.request(
              {
                  url: `${apiEndpoints.GET_EVENT_GALLERY}`,
                  method: 'POST',
                 
              },
              { eventId },
              this.headers
          );
          console.log('getEventGallery Response:', JSON.stringify(response, null, 2));
          return response;
      } catch (error) {
          console.error('Get Event Gallery Error:', error);
          swalHelper.showToast('Failed to fetch event gallery', 'error');
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
    docs?: Chapter[]; // Optional for list responses
    data?: Chapter; // For create/update responses
    message: string;
    status: number;
    success: boolean;
    totalDocs?: string | number;
    limit?: number;
    page?: number;
    totalPages?: number;
    pagingCounter?: number;
    hasPrevPage?: boolean;
    hasNextPage?: boolean;
    prevPage?: number | null;
    nextPage?: number | null;
  }
  
  export interface Chapter {
    _id: string;
    name: string;
    city_id?: string;
    city_name: string;
    fees: {
      registration_fee: number;
      renewal_fee: number;
      membership_duration_days: number;
    };
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
  
    async createChapter(data: Partial<Chapter>): Promise<ChapterResponse> {
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
  
        // Normalize the response to match ChapterResponse
        return {
          data: response.data?.data || response.data, // Handle nested data if present
          message: response.data?.message || 'Chapter created successfully',
          status: response.status || 201,
          success: response.data?.success || true,
        };
      } catch (error) {
        console.error('Create Chapter Error:', error);
        swalHelper.showToast('Failed to create chapter', 'error');
        throw error;
      }
    }
  
    async updateChapter(id: string, data: Partial<Chapter>): Promise<ChapterResponse> {
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
  
        // Normalize the response to match ChapterResponse
        return {
          data: response.data?.data || response.data, // Handle nested data if present
          message: response.data?.message || 'Chapter updated successfully',
          status: response.status || 200,
          success: response.data?.success || true,
        };
      } catch (error) {
        console.error('Update Chapter Error:', error);
        swalHelper.showToast('Failed to update chapter', 'error');
        throw error;
      }
    }
  
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

  export interface SubCategoryResponse {
    docs: SubCategory[];
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
  
  export interface SubCategory {
    _id: string;
    name: string;
    category_name: string;
    status: boolean;
    createdAt: string;
    __v: number;
  }
  

  @Injectable({
    providedIn: 'root',
  })
  export class SubCategoryService {
    private headers: any = [];
    
    constructor(private apiManager: ApiManager, private storage: AppStorage) {}
    
    private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      
      if (token != null) {
        this.headers.push({ Authorization: `Bearer ${token}` });
      }
    };
  
    async getSubCategories(data: { page: number; limit: number; search: string }): Promise<SubCategoryResponse> {
      try {
        this.getHeaders();
        
        let queryParams = `?page=${data.page}&limit=${data.limit}`;
        if (data.search) {
          queryParams += `&search=${encodeURIComponent(data.search)}`;
        }
        
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.GET_SUBCATEGORIES + queryParams,
            method: 'GET',
          },
          null,
          this.headers
        );
        
        return response.data || response;
      } catch (error) {
        console.error('API Error:', error);
        swalHelper.showToast('Failed to fetch subcategories', 'error');
        throw error;
      }
    }
  
    async createSubCategory(data: { name: string; category_name: string; status: boolean }): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.CREATE_SUBCATEGORY,
            method: 'POST',
          },
          data,
          this.headers
        );
        
        return response;
      } catch (error: any) {
        console.error('API Error:', error);
      if( error && error.error) {
        

        return error.error
      }; // Return the specific error message if available
        
        


        swalHelper.showToast('Failed to create subcategory', 'error');
        throw error;
      }
    }
  
    async updateSubCategory(id: string, data: { name: string; category_name: string; status: boolean }): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.UPDATE_SUBCATEGORY}/${id}`,
            method: 'PUT',
          },
          data,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('API Error:', error);
        swalHelper.showToast('Failed to update subcategory', 'error');
        throw error;
      }
    }
  
    async deleteSubCategory(id: string): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.DELETE_SUBCATEGORY}/${id}`,
    
            method: 'DELETE',
          },
          null,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('API Error:', error);
        swalHelper.showToast('Failed to delete subcategory', 'error');
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
      } catch (error: any) {
        console.error('Create Category Error:', error);
        
        
        if (error && error.error) {
          
          return error.error;
        }
        
        
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
      state_id?: string;
      state_name: string;
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
    
      async createCity(data: { name: string; state_name: string; status: boolean }): Promise<any> {
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
    
      async updateCity(id: string, data: { name: string; state_name: string; status: boolean }): Promise<any> {
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


export interface UserRef {
  _id: string;
  name: string;
  chapter_name: string;
  mobile_number: string;
  email: string;
}

export interface UserRefResponse {
  message: string;
  data: {
    docs: UserRef[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
  };
  status: number;
  success: boolean;
}
export interface Visitor {
  _id: string;
  name: string;
  refUserId: UserRef;
  eventId: Event;
  mobile_number: string;
  email: string;
  business_name: string;
  business_type: string;
  address: string;
  pincode: string;
  attendanceStatus: string;
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
  async getUsersByChapter(params: { chapter_name: string; search: string }): Promise<UserRefResponse> {
    try {
      this.getHeaders();
      const body = {
        chapter_name: params.chapter_name,
        search: params.search
      };
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.USER_BY_CHAPTER,
          method: 'POST',
        },
        body,
        this.headers
      );
      console.log('getUsersByChapter raw response:', response); // Debug
      return { ...response, success: true }; // Ensure 'success' property is included
    } catch (error) {
      console.error('API Error:', error);
      swalHelper.showToast('Failed to fetch users', 'error');
      throw error;
    }
  }
  async createVisitor(data: any): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.CREATE_VISITOR,
          method: 'POST',
        },
        data,
        this.headers
      );
      console.log('Create Visitor Response:', response); // Debug
      return {
        success: true,
        data: response.data || response,
        status: response.status || 201,
        message: response.message || 'Visitor added successfully',
      };
    } catch (error: any) {
      console.error('Create Visitor Error:', error);
      const errorResponse = {
        success: false,
        message: error.message || 'Failed to create visitor',
        error,
      };
      swalHelper.showToast(errorResponse.message, 'error');
      throw errorResponse;
    }
  }


async toggleVisitorAttendance(body: { visitorId: string }): Promise<any> {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.TOGGLE_VISITOR_ATTENDANCE,
          method: 'POST',
        },
        body, // Pass the body as the second argument
        this.headers
      );
      return response;
    } catch (error) {
      console.error('Error toggling visitor attendance:', error);
      swalHelper.showToast('Failed to toggle visitor attendance', 'error');
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
  }



}

  
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
  
  // export interface AttendanceRecord {
  //   _id: string;
  //   userData: UserData;
  //   eventData: EventData;
  //   createdAt: string;
  // }
  
  // export interface AttendanceReportResponse {
  //   docs: AttendanceRecord[];
  //   totalDocs: number;
  //   limit: number;
  //   page: number;
  //   totalPages: number;
  //   hasPrevPage: boolean;
  //   hasNextPage: boolean;
  //   prevPage: number | null;
  //   nextPage: number | null;
  // }
  
  // @Injectable({
  //   providedIn: 'root',
  // })
  // export class AttendanceReportService {
  //   private headers: any = [];
    
  //   constructor(private apiManager: ApiManager, private storage: AppStorage) {}
    
  //   private getHeaders = () => {
  //     this.headers = [];
  //     let token = this.storage.get(common.TOKEN);
      
  //     if (token != null) {
  //       this.headers.push({ Authorization: `Bearer ${token}` });
  //     }
  //   };
  
  //   async getAllAttendance(params: any): Promise<AttendanceReportResponse> {
  //     try {
  //       this.getHeaders();
        
  //       // Build query string
  //       const queryParams = Object.keys(params)
  //         .filter(key => params[key] !== undefined && params[key] !== null)
  //         .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  //         .join('&');
        
  //       const url = `${apiEndpoints.GET_ALL_ATTENDANCE}?${queryParams}`;
        
  //       const response = await this.apiManager.request(
  //         {
  //           url: url,
  //           method: 'GET',
  //         },
  //         null,
  //         this.headers
  //       );
        
  //       return response.data || response;
  //     } catch (error) {
  //       console.error('API Error:', error);
  //       swalHelper.showToast('Failed to fetch attendance records', 'error');
  //       throw error;
  //     }
  //   }
  // }

  export interface BannerResponse {
    banners: Banner[];
    total: number;
  }
  
  export interface Banner {
    _id: string;
    title: string;
    description: string;
    image: string;
    redirectUrl: string;
    contact: string;
    fromDate: string;
    toDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
  @Injectable({
    providedIn: 'root',
  })
  export class BannerService {
    private headers: any = [];
    
    constructor(private apiManager: ApiManager, private storage: AppStorage) {}
    
    private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      
      if (token != null) {
        this.headers.push({ Authorization: `Bearer ${token}` });
      }
    };
  
    async getBanners(data: { page: number; limit: number; search: string }): Promise<any> {
      try {
        this.getHeaders();
        
        // Create query parameters
        let queryParams = `?page=${data.page}&limit=${data.limit}`;
        if (data.search) {
          queryParams += `&search=${encodeURIComponent(data.search)}`;
        }
        
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.GET_ALL_BANNER + queryParams,
            method: 'GET',
          },
          null,
          this.headers
        );
        
        // Return the response data
        return response;
      } catch (error) {
        console.error('API Error:', error);
        swalHelper.showToast('Failed to fetch banners', 'error');
        throw error;
      }
    }
  
    async createBanner(formData: FormData): Promise<any> {
      try {
        this.getHeaders();
        
        // For file uploads, don't set Content-Type header, let browser set it
        const fileHeaders = this.headers.filter((header: any) => !header['Content-Type']);
        
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.BANNER_CREATE,
            method: 'POST',
          },
          formData,
          fileHeaders
        );
        
        return response;
      } catch (error: any) {
        console.error('Create Banner Error:', error);
        
        if (error && error.error) {
          return error.error;
        }
        
        swalHelper.showToast('Failed to create banner', 'error');
        throw error;
      }
    }
  
    async updateBanner(id: string, formData: FormData): Promise<any> {
      try {
        this.getHeaders();
        
        // For file uploads, don't set Content-Type header, let browser set it
        const fileHeaders = this.headers.filter((header: any) => !header['Content-Type']);
        
        // Add the banner ID to the form data
        formData.append('id', id);
        
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.BANNER_UPDATE,
            method: 'POST',
          },
          formData,
          fileHeaders
        );
        
        return response;
      } catch (error) {
        console.error('Update Banner Error:', error);
        swalHelper.showToast('Failed to update banner', 'error');
        throw error;
      }
    }
  
    async getBannerById(id: string): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.GET_BANNER_BY_ID}/${id}`,
            method: 'GET',
          },
          null,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('Get Banner By ID Error:', error);
        swalHelper.showToast('Failed to fetch banner details', 'error');
        throw error;
      }
    }
  
    async deleteBanner(id: string): Promise<any> {
      try {
        this.getHeaders();
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.DELETE_BANNER}/${id}`,
           
            method: 'DELETE',
          },
          null,
          this.headers
        );
        
        return response;
      } catch (error) {
        console.error('Delete Banner Error:', error);
        swalHelper.showToast('Failed to delete banner', 'error');
        throw error;
      }
    }
  
  }

  
export interface UserFeeResponse {
  docs: UserFee[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface UserFee {
  _id: string;
  name: string;
  chapter_name: string;
  mobile_number: string;
  email: string;
  fees: {
      total_fee: number;
      paid_fee: number;
      pending_fee: number;
      renewal_fee: number;
      induction_date: string;
      end_date: string;
      is_renewed: boolean;
      fee_history: {
          amount: number;
          payment_date: string;
          remarks: string;
          _id: string;
      }[];
  };
}

interface UpdateFeeRequest {
  userId: string;
  amount: number;
  remarks: string;
}
@Injectable({
  providedIn: 'root',
})
export class FeeService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);

      if (token != null) {
          this.headers.push({ Authorization: `Bearer ${token}` });
      }
  };

  async getAllUsersFee(data: { page: number; limit: number; chapter_name?: string; search?: string }): Promise<UserFeeResponse> {
      try {
          this.getHeaders();

          const response = await this.apiManager.request(
              {
                  url: apiEndpoints.GET_ALL_USERS_FEE,
                  method: 'POST',
              },
              data,
              this.headers
          );

          return response.data;
      } catch (error) {
          console.error('Error fetching user fees:', error);
          swalHelper.showToast('Failed to fetch user fees', 'error');
          throw error;
      }
  }

  async updateFee(data: UpdateFeeRequest): Promise<any> {
      try {
          this.getHeaders();

          const response = await this.apiManager.request(
              {
                  url: apiEndpoints.UPDATE_FEE,
                  method: 'POST',
              },
              data,
              this.headers
          );
          console.log('Update Fee1 Response:', response);

          return response.data;
      } catch (error) {
          console.error('Error updating fee:', error);
          swalHelper.showToast('Failed to update fee', 'error');
          throw error;
      }
  }
}
  // Add this interface to your auth.service.ts file
  export interface ContactUs {
    _id: string;
    Entityname: string;
    email: string;
    mobile_number: string;
    address: string;
    pic: string;
    message: string;
    __v: number;
  }

// export interface ContactUsResponse {
//   success: boolean;
//   message: string;
//   data: ContactUs[];
// }

// Add this service class to your auth.service.ts file
@Injectable({
  providedIn: 'root',
})
export class ContactUsService {
  private headers: any = [];
  
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async getAllContactUs(): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_All_CONTACTUS,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response;
    } catch (error) {
      console.error('API Error:', error);
      swalHelper.showToast('Failed to fetch contact us data', 'error');
      throw error;
    }
  }

  async updateContactUs(id: string, data: any): Promise<any> {
    try {
      this.getHeaders();
      
      // Check if data is FormData (for file uploads) or regular object
      const isFormData = data instanceof FormData;
      
      if (isFormData) {
        // For file uploads, don't set Content-Type header, let browser set it
        const fileHeaders = this.headers.filter((header: any) => !header['Content-Type']);
        
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.UPDATE_CONTACTUS}/${id}`, // Update this endpoint as per your API
            method: 'PUT',
          },
          data,
          fileHeaders
        );
        
        return response;
      } else {
        // For regular JSON updates
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.UPDATE_CONTACTUS}/${id}`,  // Update this endpoint as per your API
            method: 'PUT',
          },
          data,
          this.headers
        );
        
        return response;
      }
    } catch (error) {
      console.error('Update Contact Us Error:', error);
      swalHelper.showToast('Failed to update contact information', 'error');
      throw error;
    }
  }}
  export interface Event1 {
    _id: string;
    name: string;
    date: string;
    chapter_name: string;
  }
  
  export interface AttendanceResponse1 {
    eventDetails: {
      id: string;
      name: string;
      date: string;
      mode: string;
      location: string;
      chapter_name: string;
    };
    attendanceRecords: {
      docs: {
        userId: string;
        name: string;
        chapter_name: string;
        email: string;
        mobile_number: string;
        status: 'present' | 'absent';
      }[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
      pagingCounter: number;
      hasPrevPage: boolean;
      hasNextPage: boolean;
      prevPage: number | null;
      nextPage: number | null;
    };
  }
  @Injectable({
    providedIn: 'root'
  })
  export class AttendanceService1 {
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
  
    async getEventsByChapter(chapter: string): Promise<{ data: { events: Event1[] } }> {
      try {
        this.getHeaders();
        const response= await this.apiManager.request(
          {
            url: `${apiEndpoints.GET_EVENTS_BY_CHAPTER}/${encodeURIComponent(chapter)}`,
            method: 'GET'
          },
          null,
          this.headers
        );
        return {
          data: {
            events: response.data.events
          }
        };
      } catch (error) {
        console.error('Error fetching events:', error);
        swalHelper.showToast('Failed to fetch events', 'error');
        throw error;
      }
    }
  
    async getAttendanceRecords(params: { chapter: string; eventId: string; page: number; limit: number }): Promise<AttendanceResponse1> {
      try {
        this.getHeaders();
        const queryParams = `?chapter=${encodeURIComponent(params.chapter)}&eventId=${params.eventId}&page=${params.page}&limit=${params.limit}`;
        const response = await this.apiManager.request(
          {
            url: `${apiEndpoints.GET_ATTENDANCE_RECORDS}${queryParams}`,
            method: 'GET'
          },
          null,
          this.headers
        );
        return {
          eventDetails: response.data.eventDetails,
          attendanceRecords: response.data.attendanceRecords
        };
      } catch (error) {
        console.error('Error fetching attendance records:', error);
        swalHelper.showToast('Failed to fetch attendance records', 'error');
        throw error;
      }
    }
  
    async toggleAttendanceStatus(data: { eventId: string; userId: string }): Promise<any> {
      try {
        this.getHeaders();
        const response = await this.apiManager.request(
          {
            url: apiEndpoints.TOGGLE_ATTENDANCE_STATUS,
            method: 'POST'
          },
          data,
          this.headers
        );
        return response;
      } catch (error) {
        console.error('Error toggling attendance status:', error);
        swalHelper.showToast('Failed to toggle attendance status', 'error');
        throw error;
      }
    }
  }
  
  export interface Participant {
    _id: string;
    userId: {
        _id: string;
        name: string;
        chapter_name: string;
        profilePic: string;
    };
    eventId: {
        _id: string;
        name: string;
        date: string;
    };
    preference: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface ParticipantResponse {
    message: string;
    data: {
        docs: Participant[];
        totalDocs: number;
        limit: number;
        totalPages: number;
        page: number;
        pagingCounter: number;
        hasPrevPage: boolean;
        hasNextPage: boolean;
        prevPage: number | null;
        nextPage: number | null;
    };
    status: number;
    success?: boolean;
}

// Add this service class to your existing auth.service.ts
@Injectable({
    providedIn: 'root',
})
export class ParticipationService {
    private headers: any = [];

    constructor(private apiManager: ApiManager, private storage: AppStorage) {}

    private getHeaders = () => {
        this.headers = [];
        let token = this.storage.get(common.TOKEN);
        if (token != null) {
            this.headers.push({ Authorization: `Bearer ${token}` });
        }
    };

    async getAllParticipants(eventId: string): Promise<ParticipantResponse> {
        try {
            this.getHeaders();
            const response = await this.apiManager.request(
                {
                    url: `${apiEndpoints.GET_ALL_PARTICIPANTS}?t=${new Date().getTime()}`,
                    method: 'POST',
                },
                { eventId },
                this.headers
            );
            console.log('getAllParticipants Response:', JSON.stringify(response, null, 2));
            
            return response;
        } catch (error) {
            console.error('API Error:', error);
            swalHelper.showToast('Failed to fetch participants', 'error');
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
      
        induction_date: string;
      
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
    export interface Badge {
      _id: string;
      name: string;
      description: string;
      image: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
      __v: number;
    }
    
    export interface BadgeResponse {
      docs: Badge[];
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

    export interface BadgeUser {
      _id: string;
      name: string;
      chapter_name: string;
      mobile_number: string;
    
      email: string;
      badges: Array<{ badgeId: string; assignedAt: string; name: string; image: string }> | null;
    }
    
    export interface BadgeUserResponse {
      docs: BadgeUser[];
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
    export class BadgeService {
      private headers: any = [];
    
      constructor(private apiManager: ApiManager, private storage: AppStorage) {}
    
      private getHeaders = () => {
        this.headers = [];
        let token = this.storage.get(common.TOKEN);
        
        if (token != null) {
          this.headers.push({ Authorization: `Bearer ${token}` });
        }
      };
    

      async getAllBadges(data: { page: number; limit: number; search: string }): Promise<any> {
        try {
          this.getHeaders();
          
          let queryParams = `?page=${data.page}&limit=${data.limit}`;
          if (data.search) {
            queryParams += `&search=${encodeURIComponent(data.search)}`;
          }
          
          const response = await this.apiManager.request(
            {
              url: apiEndpoints.GET_ALL_BADGES + queryParams,
              method: 'GET',
            },
            null,
            this.headers
          );
          
          return response;
        } catch (error) {
          console.error('API Error:', error);
          swalHelper.showToast('Failed to fetch badges', 'error');
          throw error;
        }
      }
    
      async createBadge(formData: FormData): Promise<any> {
        try {
          this.getHeaders();
          
          const fileHeaders = this.headers.filter((header: any) => !header['Content-Type']);
          
          const response = await this.apiManager.request(
            {
              url: apiEndpoints.CREATE_BADGE,
              method: 'POST',
            },
            formData,
            fileHeaders
          );
          
          return response;
        } catch (error: any) {
          console.error('Create Badge Error:', error);
          if (error && error.error) {
            return error.error;
          }
          swalHelper.showToast('Failed to create badge', 'error');
          throw error;
        }
      }
    
      async updateBadge(id: string, formData: FormData): Promise<any> {
        try {
          this.getHeaders();
          
          const fileHeaders = this.headers.filter((header: any) => !header['Content-Type']);
          
          const response = await this.apiManager.request(
            {
              url: `${apiEndpoints.UPDATE_BADGE}/${id}`,
              method: 'PUT',
            },
            formData,
            fileHeaders
          );
          
          return response;
        } catch (error) {
          console.error('Update Badge Error:', error);
          swalHelper.showToast('Failed to update badge', 'error');
          throw error;
        }
      }
    
      async deleteBadge(id: string): Promise<any> {
        try {
          this.getHeaders();
          
          const response = await this.apiManager.request(
            {
              url: `${apiEndpoints.DELETE_BADGE}/${id}`,
              method: 'DELETE',
            },
            null,
            this.headers
          );
          
          return response;
        } catch (error) {
          console.error('Delete Badge Error:', error);
          swalHelper.showToast('Failed to delete badge', 'error');
          throw error;
        }
      }
      async getAllBadgesUsers(data: { page: number; limit: number; search: string; chapter_name?: string | null; badge_name?: string | null }): Promise<BadgeUserResponse> {
        try {
          this.getHeaders();
          const response = await this.apiManager.request(
            {
             
              url: `${apiEndpoints.GET_ALL_USERS_BADGES}`,
              method: 'POST',
            },
            data,
            this.headers
          );
          return response.data;
        } catch (error) {
          console.error('API Error:', error);
          swalHelper.showToast('Failed to fetch badge users', 'error');
          throw error;
        }
      }
    
      async assignBadge(data: { userId: string; badgeId: string }): Promise<any> {
        try {
          this.getHeaders();
          const response = await this.apiManager.request(
            {
              url: `${apiEndpoints.ASSIGN_BADGE}`,
             
             
              method: 'POST',
            },
            data,
            this.headers
          );
          return response;
        } catch (error) {
          console.error('Assign Badge Error:', error);
          swalHelper.showToast('Failed to assign badge', 'error');
          throw error;
        }
      }
    
      async unassignBadge(data: { userId: string; badgeId: string }): Promise<any> {
        try {
          this.getHeaders();
          const response = await this.apiManager.request(
            {
              url: `${apiEndpoints.UNASSIGN_BADGE}`,
              
              method: 'POST',
            },
            data,
            this.headers
          );
          return response;
        } catch (error) {
          console.error('Unassign Badge Error:', error);
          swalHelper.showToast('Failed to unassign badge', 'error');
          throw error;
        }
      }
    

    }
    // export interface PointHistory {
    //   userId: string;
    //   name: string;
    //   chapter_name: string;
    //   profilePic?: string;
    //   leaderboardPoints: {
    //     attendance_regular: number;
    //     tyfcb: number;
    //     one_to_one: number;
    //     event_attendance: number;
    //     referal: number;
    //     induction: number;
    //     visitor: number;
    //   };
    //   totalPointsSum: number;
    // }
    
    // export interface PointHistoryResponse {
    //   docs: PointHistory[];
    //   totalDocs: number;
    //   limit: number;
    //   page: number;
    //   totalPages: number;
    //   hasPrevPage: boolean;
    //   hasNextPage: boolean;
    //   prevPage: number | null;
    //   nextPage: number | null;
    // }
    
    // @Injectable({
    //   providedIn: 'root'
    // })
    // export class PointHistoryService {
    //   private headers: any = [];
    
    //   constructor(private apiManager: ApiManager, private storage: AppStorage) {}
    
    //   private getHeaders = () => {
    //     this.headers = [];
    //     let token = this.storage.get(common.TOKEN);
    //     if (token != null) {
    //       this.headers.push({ Authorization: `Bearer ${token}` });
    //     }
    //   };
    
    //   async getPointHistory(params: any): Promise<PointHistoryResponse> {
    //     try {
    //       this.getHeaders();
    
    //       const queryParams = Object.keys(params)
    //         .filter(key => params[key] !== undefined && params[key] !== null)
    //         .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    //         .join('&');
    
    //       const url = `${apiEndpoints.GET_POINT_HISTORY}?${queryParams}`;
    
    //       const response = await this.apiManager.request(
    //         {
    //           url: url,
    //           method: 'GET'
    //         },
    //         null,
    //         this.headers
    //       );
    
    //       return response.data || response;
    //     } catch (error) {
    //       console.error('API Error:', error);
    //       swalHelper.showToast('Failed to fetch point history', 'error');
    //       throw error;
    //     }
    //   }
    
    // }

    export interface PointsHistory {
      _id: string;
      userId: string;
      name: string;
      chapter_name: string;
      profilePic: string;
      one_to_one: number;
      referal: number;
      attendance_regular: number;
      induction: number;
      visitor: number;
      event_attendance: number;
      tyfcb: number;
      testimonial: number;
      totalPointsSum: number;
      leaderboardPoints: {
        one_to_one: number;
        referal: number;
        attendance_regular: number;
        induction: number;
        visitor: number;
        event_attendance: number;
        tyfcb: number;
        testimonial: number;
      };
    }
    
    export interface PointsHistoryResponse {
      docs: PointsHistory[];
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
    export class PointsHistoryService {
      private headers: any = [];
    
      constructor(private apiManager: ApiManager, private storage: AppStorage) {}
    
      private getHeaders = () => {
        this.headers = [];
        let token = this.storage.get(common.TOKEN);
        
        if (token != null) {
          this.headers.push({ Authorization: `Bearer ${token}` });
        }
      };
    
      async getAllPointsHistory(params: any): Promise<PointsHistoryResponse> {
        try {
          this.getHeaders();
          
          const response = await this.apiManager.request(
            {
              url: `${apiEndpoints.GET_ALL_POINTS_HISTORY}`,
              method: 'POST',
            },
            params,
            this.headers
          );
          
          return response.data || response;
        } catch (error) {
          console.error('API Error:', error);
          swalHelper.showToast('Failed to fetch points history', 'error');
          throw error;
        }
      }
    }