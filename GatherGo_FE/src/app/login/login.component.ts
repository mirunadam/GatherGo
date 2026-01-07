import { Component } from '@angular/core';
import { AuthService, LoginPayload } from '../services/auth.service';
import { Router } from '@angular/router';

// import { GoogleAuthProvider } from "firebase/auth";
// import { Auth, signInWithPopup } from "@angular/fire/auth";
// import { HttpClient } from "@angular/common/http";

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

  constructor(
    private auth: AuthService,
    private router: Router,

    //for Google login
    // private firebaseAuth: Auth,
    // private http: HttpClient

  ) {}

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

  //google login
   googleLogin() {
    this.auth.googleLogin().subscribe({
        next: (res: any) => {
          // Store backend auth response (using data returned from the service's Observable)
          localStorage.setItem('idToken', res.token);
          localStorage.setItem('uid', res.uid);
          localStorage.setItem('role', res.role);

          this.message = 'Google login successful!';
          this.router.navigate(['/']);
        },
        error: (err: any) => {
          console.error(err);
          this.message = 'Google login failed on frontend or backend';
        }
      });
  }
<<<<<<< Updated upstream
=======

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
>>>>>>> Stashed changes
}
