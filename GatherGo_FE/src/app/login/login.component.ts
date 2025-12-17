import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginPayload } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent{

  username = '';
  password = '';
  error = '';
  loading = false;
  message = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private injector: Injector
  ) {}

  // get authService(): AuthService {
  //   return this.injector.get(AuthService);
  // }

  submit() {
    this.error = '';
    this.loading = true;
    this.message = '';

    const payload = {
      email: this.username,   // backend expects email
      password: this.password
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.loading = false;

        // Adjust keys if backend response differs
        localStorage.setItem('token', res.token);
        localStorage.setItem('uid', res.uid);
        localStorage.setItem('role', res.role);
        localStorage.setItem('email', res.email);

        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Invalid username or password';
      }
    });
  }

  googleLogin() {
    this.loading = true;
    this.message = 'Opening Google Login...';

    this.authService.googleLogin().subscribe({
      next: (res: any) => {
        // ✅ Ensure these keys match your Java AuthResponse fields
        localStorage.setItem('idToken', res.token);
        localStorage.setItem('uid', res.uid);
        localStorage.setItem('role', res.role);
        localStorage.setItem('email', res.email);

        this.message = 'Google login successful!';
        this.router.navigate(['/']); // Redirect to Home
      },
      error: (err) => {
        console.error('Google login error:', err);
        this.message = 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }

 
  // googleLogin() {
  //   this.loading = true;
  //   this.message = 'Opening Google Login...';

  //   this.authService.googleLogin().subscribe({
  //     next: (res: any) => {
  //       if (res) {
  //         localStorage.setItem('idToken', res.token);
  //         localStorage.setItem('uid', res.uid);
  //         localStorage.setItem('role', res.role);
  //         localStorage.setItem('email', res.email);

  //         this.message = 'Google login successful!';
  //         this.router.navigate(['/']); 
  //       }
  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       console.error('Login error:', err);
  //       this.loading = false;
  //       this.message = 'Google login failed';
  //     }
  //   });
  // }
  // googleLogin() {
  //     this.auth.googleLogin().subscribe({
  //     next: (res: any) => {
  //       // Store backend auth response (using data returned from the service's Observable)
  //       localStorage.setItem('idToken', res.token);
  //       localStorage.setItem('uid', res.uid);
  //       localStorage.setItem('role', res.role);

  //       this.message = 'Google login successful!';
  //       this.router.navigate(['/']);
  //     },
  //     error: (err: any) => {
  //       console.error(err);
  //       this.message = 'Google login failed on frontend or backend';
  //     }
  //   });
  // }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}