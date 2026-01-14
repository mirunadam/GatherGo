import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, map } from 'rxjs';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';

export interface RegisterPayload {
  role: 'USER' | 'AGENCY';
  username: string;
  fullName: string;   // agency name can go here too
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //direct connection to AuthController
  private baseUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient, private afAuth: AngularFireAuth) {}

  register(data: RegisterPayload): Observable<string> {
    return this.http.post(`${this.baseUrl}/register`, data, { responseType: 'text' });
  }

  //Send { email, password } to POST /auth/login and give me the response later”
  login(data: LoginPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

    googleLogin(): Observable<any> {
      const provider = new firebase.auth.GoogleAuthProvider();

      // Use the compatibility signInWithPopup method from AngularFireAuth
      return from(this.afAuth.signInWithPopup(provider)).pipe(
        // The result contains the user object
        switchMap(result => from(result.user!.getIdToken())),
        switchMap(idToken => {
          // Send the token to the Spring Boot backend
          return this.http.post(`${this.baseUrl}/google`, idToken, {
            headers: { "Content-Type": "application/json" }
          });
        }),
        map(res => {
          console.log('Backend Google Login Response:', res);
          return res;
        })
      );
    }
}
