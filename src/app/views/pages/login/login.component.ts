import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppStorage } from '../../../core/utilities/app-storage';
import { common } from '../../../core/constants/common';
import { swalHelper } from '../../../core/constants/swal-helper';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  isPassword: boolean = true;
  isLoading: boolean = false;
  currentYear = new Date().getFullYear();

  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required, 
      Validators.email,
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6), 
    ]),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private storage: AppStorage
  ) {
    // Apply the background color to the body
    document.body.style.backgroundColor = '#3949AB';
  }

  ngOnInit(): void {
    // Check if already logged in
    if (this.storage.get(common.TOKEN)) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePassword(): void {
    this.isPassword = !this.isPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    try {
      const credentials = {
        email: this.loginForm.value.email as string,
        password: this.loginForm.value.password as string
      };

      const response = await this.authService.adminLogin(credentials);
      
      if (response && response.token) {
        // Store token and admin details
        this.storage.set(common.TOKEN, response.token);
      
        
        // Show success message
        swalHelper.showToast('Login successful', 'success');
        
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Login failed:', error);
      swalHelper.showToast('Login failed. Please check your credentials.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Clean up when component is destroyed
  ngOnDestroy(): void {
    // Reset the body background color
    document.body.style.backgroundColor = '';
  }
}