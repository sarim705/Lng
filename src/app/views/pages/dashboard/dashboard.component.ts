import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardCounts, DashboardResponse } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  loading = false;
  counts: DashboardCounts = {
    users: 0,
    admins: 0,
    asks: 0,
    referrals: 0,
    tyfcbs: 0,
    oneToOnes: 0,
    testimonials: 0,
    testimonialReqs: 0,
    banners: 0,
    events: 0,
  };

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadDashboardCounts();
  }

  loadDashboardCounts(): void {
    this.loading = true;
    this.dashboardService.getDashboardCounts()
      .then((response: DashboardResponse) => {
        console.log('Dashboard response:', response);
        // Check if response is in the expected format
        if (response && response.data) {
          this.counts = response.data;
          console.log('Dashboard counts updated:', this.counts);
        } else {
          console.error('Invalid response format:', response);
          swalHelper.showToast('Invalid data format received', 'error');
        }
        this.loading = false;
      })
      .catch(error => {
        console.error('Failed to load dashboard counts:', error);
        swalHelper.showToast('Failed to load dashboard data', 'error');
        this.loading = false;
      });
  }
}
