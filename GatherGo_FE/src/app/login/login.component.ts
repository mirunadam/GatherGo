import { Component } from '@angular/core';
import { AuthService, LoginPayload } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form = {
    email: '',
    password: ''
  };


  loading = false;
  message = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.message = '';
    this.loading = true;

    this.auth.login(this.form).subscribe({
      next: (res) => {
        this.loading = false;

        // store token + uid
        localStorage.setItem('idToken', res.idToken);
        localStorage.setItem('uid', res.localId);
        localStorage.setItem('email', res.email);

        this.message = 'Login successful!';
        this.router.navigate(['/']); // go home
      },
      error: (err) => {
        this.loading = false;
        this.message = err?.error || 'Login failed';
      }
    });
  }
}
