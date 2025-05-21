import { Routes } from '@angular/router';

import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';



import { UsersComponent } from './views/pages/users/users.component';
import { CountriesComponent } from './views/pages/country/country.component';
import { StatesComponent } from './views/pages/states/states.component';
import { DashboardComponent } from './views/pages/dashboard/dashboard.component';
import { EventsComponent } from './views/pages/events/events.component';
import { AttendanceComponent } from './views/pages/attendence/attendence.component';

import { ChaptersComponent } from './views/pages/chapter/chapter.component';
import { CategoriesComponent } from './views/pages/category/category.component';
import { CitiesComponent } from './views/pages/city/city.component';
import { LeaderboardComponent } from './views/pages/leaderboard/leaderboard.component';
import { ReferralsComponent } from './views/pages/referralReport/referralReport.component';
import { TestimonialsComponent } from './views/pages/testimonialReport/testimonialReport.component';
import { ReferralsComponentRecieved} from './views/pages/referralReportRecieved/referralReportRecieved.component';
import { OneToOneComponent } from './views/pages/oneToone/oneToone.component';
import { TyfcbComponent } from './views/pages/tyfcb/tyfcb.component';
import { VisitorsComponent } from './views/pages/visitors/visitors.component';
import { AttendanceReportComponent } from './views/pages/attendenceReport/attendence-Report.component';
import {RegisterComponent} from './views/pages/userRegisteration/userRegisteration.component';
import { PointHistoryComponent } from './views/pages/ReferralPoints/referralpoint.component';
import{AdminLoginComponent} from './views/pages/login/login.component';



export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'adminLogin' },
  { path: 'adminLogin', component: AdminLoginComponent },
  
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
    
 
    
      { path: 'users', component: UsersComponent },
      { path: 'country', component: CountriesComponent },
      { path: 'states', component: StatesComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'events', component:  EventsComponent },
      { path: 'attendence', component:   AttendanceComponent },
      { path: 'chapter', component:   ChaptersComponent },
      { path: 'category', component:   CategoriesComponent},
     
      { path: 'city', component:    CitiesComponent},
      { path: 'leaderboard', component:    LeaderboardComponent},
      { path: 'referralReport', component:    ReferralsComponent},
      { path: 'testimonialReport', component: TestimonialsComponent},
      { path: 'referralReportRecieved', component: ReferralsComponentRecieved},
      { path: 'oneTooneReport', component:OneToOneComponent},
      { path: 'tyfcb', component:TyfcbComponent},
      { path: 'VisitorsReport', component: VisitorsComponent},
      // {path: 'attendanceRecord', component: AttendanceRecord},
      {path: 'attendanceRecord', component: AttendanceReportComponent},
      {path: 'registerComponent', component: RegisterComponent},
      {path: 'referralPoints', component: PointHistoryComponent},
      {path: 'adminLogin', component: AdminLoginComponent},



      
     

      
      
    
      

      
    
      
    ],
  },
];
