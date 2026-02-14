import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'], // Same SCSS file as login
  standalone: false
})
export class SignupPage {
  signupForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.signupForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignup() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      
      // Simulate registration
      setTimeout(() => {
        this.isLoading = false;
        console.log('Registration Success:', this.signupForm.value);
        this.router.navigate(['/login']); // Go back to login after signing up
      }, 2000);
    }
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
