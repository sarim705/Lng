import { Referral } from './../../services/auth.service';
import { environment } from '../../../env/env.local';

class ApiEndpoints {
  private PATH: string = `${environment.baseURL}/${environment.route}`;
  private PATH1: string = `${environment.baseURL}`;
  
  // User Management
  public GET_USERS: string = `${this.PATH}/users`;
  public UPDATE_USER_STATUS: string = `${this.PATH}/status`;
  public DELETE_USER: string = `${this.PATH}/delete`;
  
  public GET_USER_DETAILS: string = `${this.PATH}/details`;
  public GET_ALL_COUNTRIES: string= `${this.PATH}/getAllCountries`
    public CREATE_COUNTRY: string= `${this.PATH}/createCountry`
   public DELETE_COUNTRY: string= `${this.PATH}/deleteCountry`
    public GET_COUNTRY_BY_ID: string= `${this.PATH}/getCountryById`
        public   UPDATE_COUNTRY: string= `${this.PATH}/updateCountry`

        public GET_ALL_STATES: string= `${this.PATH}/getAllStates`
              public  CREATE_STATE: string= `${this.PATH}/createState`
            public  DELETE_STATE: string= `${this.PATH}/deleteState`
            public GET_STATE_BY_ID: string= `${this.PATH}/getStateById`
        public   UPDATE_STATE: string= `${this.PATH}/updateState`

      

        public GET_DASHBOARD_COUNTS: string = `${this.PATH}/getdata/counts`
    


public  GET_ALL_EVENTS: string= `${this.PATH}/getAllEvents`
            public CREATE_EVENT: string= `${this.PATH}/createEvent`
       

        public DELETE_EVENT: string = `${this.PATH}/deleteEvent/:eventId`

            public ADD_PHOTOS_TO_EVENT: string = `${this.PATH}/event/`

            public ADD_VIDEOS_TO_EVENT: string = `${this.PATH}/event/`
       

         

             public UPDATE_EVENT: string= `${this.PATH}/updateEvent`
             public     GET_ALL_ATTENDANCE: string= `${this.PATH}/getAllAttendance`

         

        public DELETE_ATTENDANCE:string= `${this.PATH}/deleteAttendance/:attendanceId`
 
        public  CREATE_CHAPTER :string= `${this.PATH}/createChapter`
        public   UPDATE_CHAPTER :string= `${this.PATH}/updateChapter`
        public  GET_CHAPTER_BY_ID:string= `${this.PATH}/getChapterById`
        public DELETE_CHAPTER :string= `${this.PATH}/deleteChapter`
        public GET_ALL_CHAPTERS :string= `${this.PATH}/getChapters`

        public  CREATE_CATEGORY:string=`${this.PATH}/createCategory`
 public  GET_CATEGORIES:string=`${this.PATH}/getCategories`
  public   UPDATE_CATEGORY:string=`${this.PATH}/updateCategory`
public   DELETE_CATEGORY  :string=`${this.PATH}/deleteCategory`
public    GET_CATEGORY_BY_ID  :string=`${this.PATH}/getCategoryById`
public      CREATE_CITY  :string=`${this.PATH}/createCity`
public     GET_ALL_CITIES :string=`${this.PATH}/getCities`
public     GET_CITY_BY_ID :string=`${this.PATH}/getCityById`
public UPDATE_CITY:string=`${this.PATH}/updateCity`
public  DELETE_CITY:string=`${this.PATH}/deleteCity`

public  CREATE_LEADERBOARD:string=`${this.PATH}/createLeaderboard`
public  GET_ALL_LEADERBOARDS:string=`${this.PATH}/getAllLeaderboards`
public  GET_LEADERBOARD_BY_ID:string=`${this.PATH}/getLeaderboardById`
public  UPDATE_LEADERBOARD:string=`${this.PATH}/updateLeaderboard`
public  DELETE_LEADERBOARD:string=`${this.PATH}/deleteLeaderboard`
public  GET_ALL_REFERRALS:string=`${this.PATH}/referrals/`
public  GET_ALL_TESTIMONIALS:string=`${this.PATH}/testimonials/`
public  GET_ALL_REFERRALS_RECIEVED:string=`${this.PATH}/referrals/received`

public GET_ALL_ONE_TO_ONE:string=`${this.PATH}/oneToOnes/getAllOneToOne`
public GET_ALL_TYFCBS:string=`${this.PATH}/getAllTyfcb`
public GET_ALL_VISITORS:string=`${this.PATH}/getAllVisitors`
public UPDATE_VISITOR:string=`${this.PATH}/updateVisitor`
public REFERRAL_RECEIVED:string=`${this.PATH}/referrals/received`
public REFERRAL_GIVEN:string=`${this.PATH}/referrals/given`
public GET_CHAPTER_BY_CITY:string=`${this.PATH}/getChapterByCity`
public DELETE_SUBCATEGORY:string=`${this.PATH}/deleteSubCategory`
public GET_SUBCATEGORIES:string=`${this.PATH}/getSubCategories`
public CREATE_SUBCATEGORY:string=`${this.PATH}/createSubCategory`
public UPDATE_SUBCATEGORY:string=`${this.PATH}/updateSubCategory`




public REGISTER_USER:string=`${this.PATH1}/mobile/auth/register`


public GET_ALL_ATTENDANCE_REPORT:string=`${this.PATH}/getAllAttendance`

public GET_POINT_HISTORY :string=`${this.PATH}/getPointsHistory`

public ADMIN_LOGIN :string=`${this.PATH}/login`



}


export let apiEndpoints = new ApiEndpoints();



