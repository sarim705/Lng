import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(private router: Router) {}
  ngOnInit(): void {}

  list: any[] = [
    {
      moduleName: 'Startup Weaver',
      menus: [
        {
          title: 'Dashboard',
          link: 'dashboard',
          icon: 'home', // Dashboard
        },
        {
          title: 'Registeration',
          link: 'registerComponent',
          icon: 'user-plus', // User registration
        },
        {
          title: 'All Members',
          link: 'users',
          icon: 'users', // Members list
        },
        {
          title: 'Import Users',
          link: 'importUsers',
          icon: 'file-import', // File import
        },
     
        {
          title: 'Countries',
          link: 'country',
          icon: 'globe', // Global map
        },
        {
          title: 'States',
          link: 'states',
          icon: 'map', // Geographic divisions
        },
        {
          title: 'Cities',
          link: 'city',
          icon: 'map-pin', // Location point
        },
       
        {
          title: 'Chapter',
          link: 'chapter',
          icon: 'layers', // Groupings or levels
        },
        {
          title: 'Categories',
          link: 'category',
          icon: 'tag', // Categories or labels
        },
        {
          title: 'subCategories',
          link: 'subcategory',
          icon: 'list', 
          // Detailed records
        },
        {
          title: 'Banner',
          link: 'banners',
          icon: 'banner', // History or timeline
        },
        {
          title: 'Badges',
          link: 'badges',
          icon: 'award', // Recognition or achievements
        },
        
        {
          title: 'Fees Record',
          link: 'fees',
          icon: 'credit-card', // Financial transactions
        },
        {
          title: 'Attendance Data',
          link: 'attendanceRecord',
          icon: 'clipboard-list', // Detailed records
        },
      
        // {
        //   title: 'Admin Login',
        //   link: 'adminLogin',
        //   icon: 'lock', // Security or login
        // },
        {
          title: 'LeaderBoard',
          link: 'leaderboard',
          icon: 'award', // Recognition
        },
       
        {
          title: 'Events',
          link: 'events',
          icon: 'calendar', // Event planning
        },
        {
          title: 'Participation',
          link: 'participation',
          icon: 'check-circle', // Participation tracking
        },
       
        {
          title: 'Attendence',
          link: 'attendence',
          icon: 'check-square', // Checkbox tracking
        },
        {
          title: 'Referral Given Report',
          link: 'referralReport',
          icon: 'corner-up-right', // Giving referrals
        },
        {
          title: 'Referral Recieved Report',
          link: 'referralReportRecieved',
          icon: 'corner-down-left', // Receiving referrals
        },
        {
          title: 'Testimonial Report',
          link: 'testimonialReport',
          icon: 'message-square', // Comments or feedback
        },
        {
          title: 'One To one Report',
          link: 'oneTooneReport',
          icon: 'user-check', // 1-to-1 interactions
        },
        {
          title: 'Tyfcb Report',
          link: 'tyfcb',
          icon: 'trending-up', // Business metrics
        },
         {
          title: 'Visitors Report',
         link: 'VisitorsReport',
         icon: 'user', // Individual visitor
        },
        {
          title: 'Ask Management',
          link: 'askManagement',
          icon: 'question-circle', // Questions or inquiries
        },
        {
          title: 'Points History',
          link: 'pointHistory',
          icon: 'history', // History or timeline
        },

       
        {
          title: 'Attendance Record',
          link: 'attendanceRecord',
          icon: 'clipboard', // Detailed records
        },
        {
          title: 'Fees Record',
          link: 'fees',
          icon: 'credit-card', // Financial transactions
        },{
          title: 'Badge Management',
          link: 'badgeManagement',
          icon: 'cog', // Settings or management
        },
        
    
        
      ],
    },
  ];
  
    

  isMobile: boolean = false;
  activeSubMenuIndex: number | null = null;

  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
    }
  }

  navigateWithQueryParams(submenu: any) {
    this.router.navigate([submenu.link], { queryParams: submenu.queryParams });
  }

  onNavSwitch(item: string) {
    this.router.navigateByUrl(`/${item}`);
  }
}