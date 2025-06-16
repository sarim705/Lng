import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ReferralService1 } from '../../../services/auth.service';
import { ExportService } from '../../../services/export.service';
import { swalHelper } from '../../../core/constants/swal-helper';

import { debounceTime, Subject } from 'rxjs';
import { environment } from 'src/env/env.local';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

declare var $: any;
declare var bootstrap: any;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [ExportService],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, AfterViewInit {
  users: any = { docs: [], totalDocs: 0, limit: 10, page: 1, totalPages: 0 };
  loading: boolean = false;
  exporting: boolean = false;
  searchQuery: string = '';
  selectedUser: any = null;
  userDetailsModal: any;
  imageurl = environment.imageUrl;
pathurl= environment.baseURL;
  activeTab: string = 'profile';
  referralTab: string = 'given';
  referralsGiven: any[] = [];
  referralsReceived: any[] = [];
  referralsGivenTotal: number = 0;
  referralsReceivedTotal: number = 0;
  referralLoading: boolean = false;
  pdfLoading: boolean = false;
  Math = Math;

  paginationConfig = {
    id: 'users-pagination'
  };

  referralPaginationConfig = {
    givenId: 'referrals-given-pagination',
    receivedId: 'referrals-received-pagination'
  };

  payload = {
    search: '',
    page: 1,
    limit: 10
  };

  referralPayload = {
    page: 1,
    givenPage: 1,
    receivedPage: 1,
    limit: 5
  };

  private searchSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private referralService: ReferralService1,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.fetchUsers();
    });
  }

  ngOnInit(): void {
    this.fetchUsers();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const modalElement = document.getElementById('userDetailsModal');
      if (modalElement) {
        this.userDetailsModal = new bootstrap.Modal(modalElement);
      } else {
        console.warn('Modal element not found in the DOM');
      }
    }, 300);
  }

  async fetchUsers(): Promise<void> {
    this.loading = true;
    try {
      const requestData = {
        page: this.payload.page,
        limit: this.payload.limit,
        search: this.payload.search
      };
      const response = await this.authService.getUsers(requestData);
      if (response) {
        this.users = response;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      swalHelper.showToast('Failed to fetch users', 'error');
      this.users = { docs: [], totalDocs: 0, limit: this.payload.limit, page: this.payload.page, totalPages: 0 };
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  onSearch(): void {
    this.payload.page = 1;
    this.payload.search = this.searchQuery;
    this.searchSubject.next(this.searchQuery);
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/placeholder-image.png';
  }

  onChange(): void {
    this.payload.page = 1;
    this.fetchUsers();
  }

  onPageChange(page: number): void {
    if (page !== this.payload.page) {
      this.payload.page = page;
      this.fetchUsers();
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'referrals' && this.selectedUser) {
      this.referralTab = 'given';
      this.referralsGiven = [];
      this.referralsReceived = [];
      this.referralPayload.givenPage = 1;
      this.referralPayload.receivedPage = 1;
      this.fetchReferrals();
    }
  }

  setReferralTab(tab: string): void {
    this.referralTab = tab;
    this.referralPayload.givenPage = 1;
    this.referralPayload.receivedPage = 1;
    this.fetchReferrals();
  }

  async fetchReferrals(): Promise<void> {
    if (!this.selectedUser?._id) {
      console.warn('No user ID available for fetching referrals');
      return;
    }

    this.referralLoading = true;
    try {
      let response;
      if (this.referralTab === 'given') {
        response = await this.referralService.getReferralsGiven(this.selectedUser._id, {
          page: this.referralPayload.givenPage,
          limit: this.referralPayload.limit
        });
        this.referralsGiven = (response?.data && Array.isArray(response.data.docs)) ? response.data.docs : [];
        this.referralsGivenTotal = response?.data?.totalDocs || 0;
      } else {
        response = await this.referralService.getReferralsReceived(this.selectedUser._id, {
          page: this.referralPayload.receivedPage,
          limit: this.referralPayload.limit
        });
        this.referralsReceived = (response?.data && Array.isArray(response.data.docs)) ? response.data.docs : [];
        this.referralsReceivedTotal = response?.data?.totalDocs || 0;
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching referrals:', error);
      swalHelper.showToast('Failed to fetch referrals', 'error');
      this.referralsGiven = [];
      this.referralsReceived = [];
      this.referralsGivenTotal = 0;
      this.referralsReceivedTotal = 0;
    } finally {
      this.referralLoading = false;
      this.cdr.detectChanges();
    }
  }

  onGivenReferralPageChange(page: number): void {
    if (page !== this.referralPayload.givenPage) {
      this.referralPayload.givenPage = page;
      this.fetchReferrals();
    }
  }

  onReceivedReferralPageChange(page: number): void {
    if (page !== this.referralPayload.receivedPage) {
      this.referralPayload.receivedPage = page;
      this.fetchReferrals();
    }
  }

  viewUserDetails(user: any): void {
    this.selectedUser = user;
    this.activeTab = 'profile';
    this.referralTab = 'given';
    this.referralsGiven = [];
    this.referralsReceived = [];
    this.referralsGivenTotal = 0;
    this.referralsReceivedTotal = 0;

    if (this.userDetailsModal) {
      this.userDetailsModal.show();
    } else {
      try {
        const modalElement = document.getElementById('userDetailsModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.userDetailsModal = modalInstance;
          modalInstance.show();
        } else {
          $('#userDetailsModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        $('#userDetailsModal').modal('show');
      }
    }
  }

  closeModal(): void {
    if (this.userDetailsModal) {
      this.userDetailsModal.hide();
    } else {
      $('#userDetailsModal').modal('hide');
    }
  }

  async toggleUserStatus(user: any): Promise<void> {
    try {
      this.loading = true;
      const response = await this.authService.toggleUserStatus({ id: user._id });
      if (response && response.success) {
        user.isActive = response.data; // Update the local user object
        swalHelper.showToast(`User status changed to ${response.data ? 'Active' : 'Inactive'}`, 'success');
      } else {
        const errorMessage = response?.message || 'Failed to update user status';
        console.error('Toggle user status failed:', errorMessage);
        swalHelper.showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      swalHelper.showToast('Failed to update user status', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const result = await swalHelper.confirmation(
        'Delete User',
        'Are you sure you want to delete this user? This action cannot be undone.',
        'warning'
      );

      if (result.isConfirmed) {
        this.loading = true;
        const response = await this.authService.deleteUser(userId);
        if (response.success) {
          swalHelper.showToast('User deleted successfully', 'success');
          this.fetchUsers();
        } else {
          swalHelper.showToast(response.message || 'Failed to delete user', 'error');
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      swalHelper.showToast('Failed to delete user', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  async generateUserPDF(): Promise<void> {
    this.pdfLoading = true;
    swalHelper.showToast('Generating User PDF, please wait...', 'info');

    try {
      const userId = this.selectedUser._id;
      if (!userId) {
        throw new Error('User ID is not available');
      }

      const pdfUrl = `${this.pathurl}/admin/${userId}/pdf`;
      console.log('PDF URL:', pdfUrl);
      
      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${this.selectedUser.name || 'user'}_profile.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      swalHelper.showToast('PDF download initiated successfully', 'success');
    } catch (error) {
      console.error('Error initiating PDF download:', error);
      swalHelper.showToast('Failed to initiate PDF download', 'error');
    } finally {
      this.pdfLoading = false;
      this.cdr.detectChanges();
    }
  }

  async exportToPDF(): Promise<void> {
    this.exporting = true;
    swalHelper.showToast('Generating PDF, please wait...', 'info');

    const currentPage = this.payload.page;
    const currentLimit = this.payload.limit;
    const currentSearch = this.payload.search;

    const generatePDF = async (allUsers: any[]): Promise<void> => {
      try {
        const pdf = new jspdf.jsPDF('l', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;

        pdf.setFontSize(18);
        pdf.setTextColor(44, 62, 80);
        pdf.text('Member List Report', margin, margin + 10);

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, margin + 18);
        if (currentSearch) {
          pdf.text(`Search query: "${currentSearch}"`, margin, margin + 24);
        }

        interface TableColumn {
          header: string;
          dataKey: string;
          width: number;
        }

        const columns: TableColumn[] = [
          { header: 'Name', dataKey: 'name', width: 0.25 },
          { header: 'Business', dataKey: 'business', width: 0.25 },
          { header: 'Mobile', dataKey: 'mobile', width: 0.15 },
          { header: 'Email', dataKey: 'email', width: 0.20 },
          { header: 'Role', dataKey: 'role', width: 0.15 }
        ];

        const tableTop = margin + 30;
        const tableWidth = pageWidth - (margin * 2);
        const rowHeight = 12;

        pdf.setFillColor(236, 240, 241);
        pdf.rect(margin, tableTop, tableWidth, rowHeight, 'F');

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(44, 62, 80);

        let xPos = margin;
        columns.forEach(column => {
          const colWidth = tableWidth * column.width;
          pdf.text(column.header, xPos + 3, tableTop + 8);
          xPos += colWidth;
        });

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(50, 50, 50);

        let yPos = tableTop + rowHeight;
        let pageNo = 1;

        for (let i = 0; i < allUsers.length; i++) {
          const user = allUsers[i];

          if (yPos > pageHeight - margin) {
            pdf.addPage();
            pageNo++;

            pdf.setFillColor(236, 240, 241);
            pdf.rect(margin, margin, tableWidth, rowHeight, 'F');

            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(44, 62, 80);

            xPos = margin;
            columns.forEach(column => {
              const colWidth = tableWidth * column.width;
              pdf.text(column.header, xPos + 3, margin + 8);
              xPos += colWidth;
            });

            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(50, 50, 50);

            yPos = margin + rowHeight;
          }

          if (i % 2 === 1) {
            pdf.setFillColor(245, 245, 245);
            pdf.rect(margin, yPos, tableWidth, rowHeight, 'F');
          }

          interface UserData {
            name: string;
            business: string;
            mobile: string;
            email: string;
            role: string;
            [key: string]: string;
          }

          const userData: UserData = {
            name: user.name || 'Unknown User',
            business: user.business && user.business.length > 0 ? user.business[0].business_name : 'N/A',
            mobile: user.mobile_number || 'N/A',
            email: user.email || 'N/A',
            role: user.meeting_role || 'N/A'
          };

          xPos = margin;
          columns.forEach(column => {
            const colWidth = tableWidth * column.width;
            let text = userData[column.dataKey] || '';
            if (text.length > 25) {
              text = text.substring(0, 22) + '...';
            }
            pdf.text(text, xPos + 3, yPos + 8);
            xPos += colWidth;
          });

          pdf.setDrawColor(220, 220, 220);
          pdf.line(margin, yPos + rowHeight, margin + tableWidth, yPos + rowHeight);

          yPos += rowHeight;
        }

        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(150, 150, 150);
        pdf.setFontSize(8);

        const totalText = `Total Members: ${allUsers.length}`;
        pdf.text(totalText, margin, pageHeight - 10);

        for (let p = 1; p <= pageNo; p++) {
          pdf.setPage(p);
          pdf.text(`Page ${p} of ${pageNo}`, pageWidth - 30, pageHeight - 10);
        }

        pdf.save('members_list.pdf');
        swalHelper.showToast('PDF exported successfully', 'success');
      } catch (error) {
        console.error('Error generating PDF:', error);
        swalHelper.showToast('Failed to generate PDF', 'error');
      } finally {
        this.exporting = false;
      }
    };

    if (this.users.totalDocs <= this.users.docs.length) {
      generatePDF(this.users.docs);
    } else {
      const fetchAllUsers = async (): Promise<void> => {
        try {
          const requestData = {
            page: 1,
            limit: this.users.totalDocs,
            search: currentSearch
          };
          const response = await this.authService.getUsers(requestData);
          if (response && response.docs) {
            generatePDF(response.docs);
          } else {
            throw new Error('Failed to fetch all users');
          }
        } catch (error) {
          console.error('Error fetching all users for PDF:', error);
          swalHelper.showToast('Failed to fetch all users for PDF', 'error');
          this.exporting = false;
        }
      };
      fetchAllUsers();
    }
  }

  async exportToExcel(): Promise<void> {
    this.exporting = true;
    swalHelper.showToast('Generating Excel, please wait...', 'info');

    const currentPage = this.payload.page;
    const currentLimit = this.payload.limit;
    const currentSearch = this.payload.search;

    const generateExcel = async (allUsers: any[]): Promise<void> => {
      try {
        const userData = allUsers.map(user => ({
          Name: user.name || 'Unknown User',
          Business: user.business && user.business.length > 0 ? user.business[0].business_name : 'N/A',
          Mobile: user.mobile_number || 'N/A',
          Email: user.email || 'N/A',
          Role: user.meeting_role || 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(userData);

        const columnWidths = [
          { wch: 30 },
          { wch: 40 },
          { wch: 20 },
          { wch: 30 },
          { wch: 20 }
        ];
        worksheet['!cols'] = columnWidths;

        const headers = ['Name', 'Business', 'Mobile', 'Email', 'Role'];
        headers.forEach((header, index) => {
          const cell = String.fromCharCode(65 + index) + '1';
          if (worksheet[cell]) {
            worksheet[cell].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: 'ECEFF1' } }
            };
          }
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');

        const metadata = [
          ['Report', 'Member List Report'],
          ['Generated on', new Date().toLocaleString()],
          ['Search query', currentSearch || 'None'],
          ['Total Members', allUsers.length.toString()]
        ];
        const metadataSheet = XLSX.utils.aoa_to_sheet(metadata);
        metadataSheet['!cols'] = [{ wch: 20 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');

        XLSX.writeFile(workbook, 'members_list.xlsx');
        swalHelper.showToast('Excel exported successfully', 'success');
      } catch (error) {
        console.error('Error generating Excel:', error);
        swalHelper.showToast('Failed to generate Excel', 'error');
      } finally {
        this.exporting = false;
      }
    };

    if (this.users.totalDocs <= this.users.docs.length) {
      generateExcel(this.users.docs);
    } else {
      const fetchAllUsers = async (): Promise<void> => {
        try {
          const requestData = {
            page: 1,
            limit: this.users.totalDocs,
            search: currentSearch
          };
          const response = await this.authService.getUsers(requestData);
          if (response && response.docs) {
            generateExcel(response.docs);
          } else {
            throw new Error('Failed to fetch all users');
          }
        } catch (error) {
          console.error('Error fetching all users for Excel:', error);
          swalHelper.showToast('Failed to fetch all users for Excel', 'error');
          this.exporting = false;
        }
      };
      fetchAllUsers();
    }
  }
}