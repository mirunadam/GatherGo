import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    this.error = '';
    this.loading = true;

    const payload = {
      email: this.username,   // backend expects email
      password: this.password
    };

    this.auth.login(payload).subscribe({
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

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
