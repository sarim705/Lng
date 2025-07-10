// side-bar.component.ts
import { AppWorker } from './../../../core/workers/app.worker';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SideBarService } from './side-bar.service';
import { CommonModule } from '@angular/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit {
  constructor(
    private router: Router,
    private storage: AppStorage,
    public authService: AuthService,
    public sideBarService: SideBarService,
    public appWorker: AppWorker,
  ) {}

  isSidebarOpen = false;
  isMobile = false;

  ngOnInit() {
    this.checkScreenSize();
    
    // Ensure sidebar is closed on mobile by default
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const previousIsMobile = this.isMobile;
    this.isMobile = window.innerWidth < 992;
    
    // Close sidebar when switching to mobile
    if (this.isMobile && !previousIsMobile) {
      this.isSidebarOpen = false;
    }
    
    // Auto-close sidebar when switching from mobile to desktop
    if (!this.isMobile && previousIsMobile) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  logout = async () => {
    let confirm = await swalHelper.confirmation(
      'Logout',
      'Do you really want to logout',
      'question'
    );
    if (confirm.isConfirmed) {
      this.storage.clearAll();
      window.location.href = '/';
    }
  };
}