//this Angular's Component decorator 
import { Component } from '@angular/core';
//What u use to talk to the backend APi
import { AuthService, LoginPayload } from '../services/auth.service';
//Angular's navigation system
import { Router } from '@angular/router';
// import { NgFor, NgIf } from '@angular/common';
// //import { NgModel } from '@angular/forms';
// import { NgClass } from '@angular/common';
// import { FormsModule } from '@angular/forms'
// import { GoogleAuthProvider } from "firebase/auth";
// import { Auth, signInWithPopup } from "@angular/fire/auth";
// import { HttpClient } from "@angular/common/http";

@Component({
  //this is an HTML tag special for this component
  selector: 'app-login',
  //points to the html file for this component
  templateUrl: './login.component.html',
  // standalone: true,
  // imports: [
  //   NgFor,
  //   NgIf,
  //   FormsModule,
  //   NgClass,
  // ],
  //points to the scss file,styles are only for this component
  styleUrls: ['./login.component.scss']
})

//deifnes the component logic, export allows Angular to use it
//everything inside this controls data,events,APi calls,navigation
export class LoginComponent {
  //this form model is very important
  //daca ma uit atent asta este exact ce introduc si pe pagina atunci cand vreau sa ma conectez
  form = {
    email: '',
    password: ''
  };

  //UI state variables,we can reuse them in every component
  //loading=used to disable buttons
  loading = false;
  //feedback to the user
  message = '';

  //using the constructor we inject instances automatically
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  //this submit is triggered when we press the Login button on the page
  submit() {
    //this should be done before API calls
    //clears previous messages
    this.message = '';
    //show the loading state
    this.loading = true;

    this.auth.login(this.form).subscribe({
      //response from backend
      //this response should come from /auth/login
      next: (res) => {
        this.loading = false;

        // store token + uid
        localStorage.setItem('idToken', res.idToken);
        localStorage.setItem('uid', res.localId);
        localStorage.setItem('email', res.email);

        this.message = 'Login successful!';
        this.router.navigate(['/']);//redirection to homepage after succesfull login
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

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}