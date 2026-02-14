import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router 
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]], 
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    const savedEmail = localStorage.getItem('savedEmail');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (rememberMe && savedEmail) {
      this.loginForm.patchValue({
        email: savedEmail,
        rememberMe: true
      });
    }
  }

  // --- NEW METHOD TO NAVIGATE TO SIGNUP ---
  goToSignup() {
    this.router.navigate(['/signup']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password, rememberMe } = this.loginForm.value;

      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('rememberMe');
      }

      setTimeout(() => {
        console.log('Login successful!', this.loginForm.value);
        this.isLoading = false;
        this.router.navigate(['/technodev']); 
      }, 1500);
    }
  }
}
