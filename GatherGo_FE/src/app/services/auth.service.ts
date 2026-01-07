import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Observable, from, switchMap, map } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

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
  private baseUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient, private afAuth: AngularFireAuth) {}

  register(data: RegisterPayload): Observable<string> {
    return this.http.post(`${this.baseUrl}/register`, data, { responseType: 'text' });
  }

  login(data: LoginPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

<<<<<<< Updated upstream
  //  googleLogin(): void {
  //   const provider = new GoogleAuthProvider();
  //   signInWithPopup(this.auth, provider)
  //     .then(async result => {
  //       const idToken = await result.user.getIdToken();
  //       // send the token to backend
  //       this.http.post(`${this.baseUrl}/google`, { idToken }, { responseType: 'text' })
  //         .subscribe(res => console.log('Backend Google Login Response:', res));
  //     })
  //     .catch(err => console.error('Google login failed', err));
  // }

=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
  // ✅ New unified Google Login method
  // googleLogin(): Observable<any> {
  //   const provider = new firebase.auth.GoogleAuthProvider();
  //   provider.setCustomParameters({ prompt: 'select_account' });

  //   // 1. Open the popup using AngularFire Compatibility API
  //   return from(this.afAuth.signInWithPopup(provider)).pipe(
  //     // 2. Extract the ID Token from the user result
  //     switchMap(result => from(result.user!.getIdToken())),
  //     // 3. Send the raw token to your Spring Boot backend
  //     switchMap(idToken => {
  //       return this.http.post(`${this.baseUrl}/google`, idToken, {
  //         headers: { "Content-Type": "application/json" }
  //       });
  //     })
  //   );
  // }

  //  googleLogin(): void {
  //   const provider = new GoogleAuthProvider();
  //   signInWithPopup(this.auth, provider)
  //     .then(async result => {
  //       const idToken = await result.user.getIdToken();
  //       // send the token to backend
  //       this.http.post(`${this.baseUrl}/google`, { idToken }, { responseType: 'text' })
  //         .subscribe(res => console.log('Backend Google Login Response:', res));
  //     })
  //     .catch(err => console.error('Google login failed', err));
  // }

  // googleLogin(): Observable<any> {
  //   const provider = new firebase.auth.GoogleAuthProvider();

  //   // Use the compatibility signInWithPopup method from AngularFireAuth
  //   return from(this.afAuth.signInWithPopup(provider)).pipe(
  //     // The result contains the user object
  //     switchMap(result => from(result.user!.getIdToken())),
  //     switchMap(idToken => {
  //       // Send the token to the Spring Boot backend
  //       return this.http.post(`${this.baseUrl}/google`, idToken, {
  //         headers: { "Content-Type": "application/json" }
  //       });
  //     }),
  //     map(res => {
  //       console.log('Backend Google Login Response:', res);
  //       return res;
  //     })
  //   );
  // }

  // googleLoginRedirect(): Promise<void> {
  //   const provider = new GoogleAuthProvider();
  //   // This method redirects the entire page to Google's sign-in flow
  //   return signInWithRedirect(this.auth, provider);
  // }

  // // 2. Checks for the result when the user comes back to the app
  // handleRedirectResult(): Observable<any | null> {
  //   // getRedirectResult returns a Promise that resolves when the page loads after redirect
  //   return from(getRedirectResult(this.auth)).pipe(
  //   switchMap((result: UserCredential | null) => {
  //     if (!result || !result.user) return [null];

  //     return from(result.user.getIdToken()).pipe(
  //       switchMap(idToken => {
  //         // Send raw token as JSON body
  //         return this.http.post(`${this.baseUrl}/google`, JSON.stringify(idToken), {
  //           headers: { "Content-Type": "application/json" }
  //         });
  //       })
  //     );
  //   })
  // );
  // }
>>>>>>> Stashed changes
}
