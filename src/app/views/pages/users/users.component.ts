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
      const updatedStatus = !user.acc_active;
      await this.authService.updateUserStatus(user._id, updatedStatus);
      user.acc_active = updatedStatus;
      swalHelper.showToast(`User status changed to ${updatedStatus ? 'Active' : 'Inactive'}`, 'success');
    } catch (error) {
      console.error('Error updating user status:', error);
      swalHelper.showToast('Failed to update user status', 'error');
    } finally {
      this.loading = false;
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
        await this.authService.deleteUser(userId);
        swalHelper.showToast('User deleted successfully', 'success');
        this.fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      swalHelper.showToast('Failed to delete user', 'error');
    } finally {
      this.loading = false;
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
      const user = this.selectedUser;
      const business = user.business && user.business.length > 0 ? user.business[0] : null;

      const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const cardPadding = 8;
      const blackColor = [0, 0, 0];
      const primaryColor = [13, 110, 253];
      const labelWidth = 50;
      let yPos = margin;

      pdf.setFont('helvetica');

      const addSectionHeader = (text: string, y: number): number => {
        pdf.setFontSize(14);
        pdf.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(text, margin, y);
        pdf.setDrawColor(blackColor[0], blackColor[1], blackColor[2]);
        pdf.line(margin, y + 3, pageWidth - margin, y + 3);
        return y + 10;
      };

      const addCard = (title: string, content: string[][], y: number): number => {
        pdf.setFontSize(10);
        const lineHeight = 7;
        let contentHeight = 0;

        content.forEach(item => {
          const lines = pdf.splitTextToSize(item[1], pageWidth - 2 * margin - 2 * cardPadding - labelWidth);
          contentHeight += (lines.length * lineHeight);
        });

        const cardHeight = contentHeight + 20;

        if (y + cardHeight > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          y = margin;
        }

        pdf.setDrawColor(blackColor[0], blackColor[1], blackColor[2]);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, y, pageWidth - 2 * margin, cardHeight, 'S');

        pdf.setFontSize(12);
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + cardPadding, y + cardPadding + 4);

        pdf.setFontSize(10);
        pdf.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
        pdf.setFont('helvetica', 'normal');

        let contentY = y + cardPadding + 10;
        content.forEach(item => {
          const [label, value] = item;
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${label}:`, margin + cardPadding, contentY);
          pdf.setFont('helvetica', 'normal');
          const lines = pdf.splitTextToSize(value, pageWidth - 2 * margin - 2 * cardPadding - labelWidth);
          pdf.text(lines, margin + cardPadding + labelWidth, contentY);
          contentY += (lines.length * lineHeight);
        });

        return y + cardHeight + 10;
      };

      pdf.setFontSize(18);
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('User Profile', margin, yPos);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPos + 8);
      yPos += 20;

      yPos = addSectionHeader('Basic Information', yPos);

      const profileContent = [
        ['Name', user.name || 'N/A'],
        ['Email', user.email || 'N/A'],
        ['Mobile', user.mobile_number || 'N/A'],
        ['Role', user.meeting_role || 'N/A'],
        ['Chapter', user.chapter_name || 'N/A'],
        ['Points', user.points?.toString() || 'N/A'],
        ['Address', user.address || 'N/A'],
        ['Introduction', user.introduction_details || 'N/A']
      ];
      yPos = addCard('Personal Details', profileContent, yPos);

      if (business) {
        yPos = addSectionHeader('Business Information', yPos);
        const businessContent = [
          ['Business Name', business.business_name || 'N/A'],
          ['Business Type', business.business_type || 'N/A'],
          ['Category', business.category || 'N/A'],
          ['Sub-Category', business.sub_category || 'N/A'],
          ['Product', business.product || 'N/A'],
          ['Service', business.service || 'N/A'],
          ['Formation', business.formation || 'N/A'],
          ['Established', business.establishment ? new Date(business.establishment).toLocaleDateString() : 'N/A'],
          ['Team Size', business.team_size?.toString() || 'N/A'],
          ['Business Email', business.email || 'N/A'],
          ['Business Phone', business.mobile_number || 'N/A'],
          ['Website', business.website || 'N/A'],
          ['Address', business.address || 'N/A'],
          ['Description', business.about_business_details || 'N/A']
        ];
        yPos = addCard('Business Details', businessContent, yPos);
      }

      if (user.bioDetails) {
        yPos = addSectionHeader('Personal Bio', yPos);
        const bioContent = [
          ['Spouse', user.bioDetails.spouse || 'N/A'],
          ['Children', user.bioDetails.children || 'N/A'],
          ['Pets', user.bioDetails.pets || 'N/A'],
          ['City of Residence', user.bioDetails.cityOfResidence || 'N/A'],
          ['Years in City', user.bioDetails.yearInThatCity || 'N/A'],
          ['Years in Business', user.bioDetails.yearsInBusiness || 'N/A'],
          ['Hobbies', user.bioDetails.hobbies || 'N/A'],
          ['Previous Business', user.bioDetails.previousTypesOfBusiness || 'N/A'],
          ['Burning Desire', user.bioDetails.myBurningDesire || 'N/A'],
          ['Key to Success', user.bioDetails.myKeyToSuccess || 'N/A'],
          ['Something Unique', user.bioDetails.somethingNoOne || 'N/A']
        ];
        yPos = addCard('Bio Details', bioContent, yPos);
      }

      if (user.growthSheet) {
        yPos = addSectionHeader('Professional Growth', yPos);
        const growthContent = [
          ['Accomplishment', user.growthSheet.accomplishment || 'N/A'],
          ['Goals', user.growthSheet.goals || 'N/A'],
          ['Skills', user.growthSheet.skills || 'N/A'],
          ['Interests', user.growthSheet.interests || 'N/A'],
          ['Networks', user.growthSheet.networks || 'N/A']
        ];
        yPos = addCard('Growth Sheet', growthContent, yPos);
      }

      if (user.topProfile) {
        yPos = addSectionHeader('Professional Highlights', yPos);
        const topProfileContent = [
          ['Favorite LGN Story', user.topProfile.favouriteLgnStory || 'N/A'],
          ['Top Problem Solved', user.topProfile.topProblemSolved || 'N/A'],
          ['Top Product', user.topProfile.topProduct || 'N/A'],
          ['Ideal Referral', user.topProfile.idealReferral || 'N/A'],
          ['Ideal Referral Partner', user.topProfile.idealReferralParter || 'N/A']
        ];
        yPos = addCard('Top Profile', topProfileContent, yPos);
      }

      if (user.weeklyPresentation) {
        yPos = addSectionHeader('Presentations', yPos);
        const presentationContent = [
          ['Presentation 1', user.weeklyPresentation.presentation1 || 'N/A'],
          ['Presentation 2', user.weeklyPresentation.presentation2 || 'N/A']
        ];
        yPos = addCard('Weekly Presentations', presentationContent, yPos);
      }

      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pdf.internal.pageSize.getHeight() - 10);
      }

      pdf.save(`${user.name || 'user'}_profile.pdf`);
      swalHelper.showToast('PDF generated successfully', 'success');
    } catch (error) {
      console.error('Error generating user PDF:', error);
      swalHelper.showToast('Failed to generate user PDF', 'error');
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