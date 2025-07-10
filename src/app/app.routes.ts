import { Routes } from '@angular/router';

import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { BannersComponent } from './views/pages/banner/banner.component';



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
import { AttendanceDataComponent } from './views/pages/attendenceRecord/attendenceRecord.component';
import {RegisterComponent} from './views/pages/userRegisteration/userRegisteration.component';
import { PointsHistoryComponent } from './views/pages/pointHistory/pointhistory.component';
import{AdminLoginComponent} from './views/pages/login/login.component';
import { SubCategoriesComponent } from './views/pages/subcategory/subcategory.component';
import { ParticipationComponent } from './views/pages/participation/participation.component';
import { ImportUsersComponent } from './views/pages/importUser/import-users.component';
import {FeesComponent} from './views/pages/feesRecord/fees.component';
import { BadgesComponent } from './views/pages/badges/badges.component';
import {BadgeManagementComponent} from './views/pages/usersbadge/usersbadge.component';
import { AskManagementComponent } from './views/pages/ask/ask.component';
import { ComplaintsComponent } from './views/pages/complaints/complaints.component';
import { SuggestionsComponent } from './views/pages/suggestion/suggestion.component';


export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'adminLogin' },
  { path: 'adminLogin', component: AdminLoginComponent },
  
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
    
 
    
      { path: 'users', component: UsersComponent },
      {path: 'importUsers', component: ImportUsersComponent},
      { path: 'country', component: CountriesComponent },
      { path: 'states', component: StatesComponent },
      { path: 'dashboard', component: DashboardComponent },
      {path: 'suggestions', component: SuggestionsComponent},
      { path: 'events', component:  EventsComponent },
      { path: 'attendence', component:   AttendanceComponent },
      { path: 'chapter', component:   ChaptersComponent },
      { path: 'category', component:   CategoriesComponent},
      {path: 'subcategory', component: SubCategoriesComponent},
      {path: 'complaints', component: ComplaintsComponent },
     
      { path: 'city', component:    CitiesComponent},
      { path: 'leaderboard', component:    LeaderboardComponent},
      { path: 'referralReport', component:    ReferralsComponent},
      { path: 'testimonialReport', component: TestimonialsComponent},
      { path: 'referralReportRecieved', component: ReferralsComponentRecieved},
      { path: 'oneTooneReport', component:OneToOneComponent},
      { path: 'tyfcb', component:TyfcbComponent},
      { path: 'VisitorsReport', component: VisitorsComponent},
     
      {path: 'attendanceRecord', component: AttendanceDataComponent },
      {path: 'registerComponent', component: RegisterComponent},
      {path: 'pointHistory', component: PointsHistoryComponent },
      {path: 'adminLogin', component: AdminLoginComponent},
      {path: 'participation', component: ParticipationComponent}, 
      {
        path: 'banners',component: BannersComponent
      },
      {path: 'fees', component: FeesComponent},
      {path: 'badges', component: BadgesComponent},
      {
        path: 'badgeManagement', component: BadgeManagementComponent,
        
      },
    {path: 'askManagement', component: AskManagementComponent},
      
      
      
    ],
  },
];
