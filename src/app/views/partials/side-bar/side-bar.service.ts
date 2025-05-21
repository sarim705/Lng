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
          icon: 'home', // Feather: Home page/dashboard
        },
        {
          title: 'Registeration',
          link: 'registerComponent',
          icon: 'user-plus', // Feather: Adding a new user/registration
        },
        {
          title: 'All Members',
          link: 'users',
          icon: 'users', // Feather: Multiple users/members
        },
        {
          title: 'Countries',
          link: 'country',
          icon: 'globe', // Feather: Global/countries
        },
        {
          title: 'States',
          link: 'states',
          icon: 'map', // Feather: Regional divisions
        },
        {
          title: 'City',
          link: 'city',
          icon: 'map-pin', // Feather: Specific locations/cities
        },
        {
          title: 'Chapter',
          link: 'chapter',
          icon: 'bookmark', // Feather: Organized groups/chapters
        },
        {
          title: 'Category',
          link: 'category',
          icon: 'tag', // Feather: Categorization/tags
        },
        {
          title: 'LeaderBoard',
          link: 'leaderboard',
          icon: 'award', // Feather: Rankings/achievements
        },
        {
          title: 'Events',
          link: 'events',
          icon: 'calendar', // Feather: Events/schedule
        },
        {
          title: 'Attendence',
          link: 'attendence',
          icon: 'check-square', // Feather: Tracking attendance
        },
        {
          title: 'Referral Given Report',
          link: 'referralReport',
          icon: 'share', // Feather: Giving referrals
        },
        /*{
          title: 'Testimonial Report',
          link: 'testimonialReport',
          icon: 'message-square', // Feather: Testimonials/comments
        },*/,
        {
          title: 'Referral Recieved Report',
          link: 'referralReportRecieved',
          icon: 'download', // Feather: Receiving referrals
        },
        {
          title: 'One To one Report',
          link: 'oneTooneReport',
          icon: 'user-check', // Feather: One-to-one interactions
        },
        
        {
          title: 'Tyfcb Report',
          link: 'tyfcb',
          icon: 'trending-up', // Feather: Business analytics (assuming TYFCB is "Thank You For Closing Business")
        },
        {
          title: 'Visitors Report',
          link: 'VisitorsReport',
          icon: 'user', // Feather: Visitor tracking
        },
        {
          title: 'Attendance Record',
          link: 'attendanceRecord',
          icon: 'book', // Feather: Detailed attendance records
        },
        /*{
          title: 'Referral Points Point',
          link: 'referralPoints',
          icon: 'star', // Feather: Points/rewards
        }*/,
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