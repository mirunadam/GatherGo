import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, from, switchMap, map, BehaviorSubject, tap} from 'rxjs';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  UserCredential,
  authState
} from '@angular/fire/auth';
import firebase from 'firebase/compat/app';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {signal, computed} from '@angular/core';
import {UserRole} from '../shared-domain/user-role.model';

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
  private loginSubject = new BehaviorSubject<boolean | undefined>(undefined);

  // private auth = inject(Auth);
  // private http = inject(HttpClient);

  // user$ = authState(this.auth);

  userRole = signal<UserRole>((localStorage.getItem('role') as UserRole) || 'USER');

  constructor(private http: HttpClient, private afAuth: AngularFireAuth) {
  }

  register(data: RegisterPayload): Observable<string> {
    return this.http.post(`${this.baseUrl}/register`, data, {responseType: 'text'});
  }

  getLoginSubject() {
    return this.loginSubject
  }

  //Send { email, password } to POST /auth/login and give me the response later”
  login(data: LoginPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data).pipe(
      map(res => {
        this.handleAuthSuccess(res);
        return res;
      }),
      tap(res => {
        this.loginSubject.next(true);
      })
    );
  }

  googleLogin(): Observable<any> {
    //   const provider = new GoogleAuthProvider();
    // provider.setCustomParameters({ prompt: 'select_account' });

    // return from(signInWithPopup(this.auth, provider)).pipe(
    //   switchMap(result => from(result.user.getIdToken())),
    //   switchMap(idToken =>
    //     this.http.post(`${this.baseUrl}/google`, idToken, {
    //       headers: { 'Content-Type': 'application/json' }
    //     })
    //   ),
    //   map(res => {
    //     this.handleAuthSuccess(res);
    //     return res;
    //   }));

    //Previous version
    const provider = new firebase.auth.GoogleAuthProvider();

    // Use the compatibility signInWithPopup method from AngularFireAuth
    return from(this.afAuth.signInWithPopup(provider)).pipe(
      // The result contains the user object
      switchMap(result => from(result.user!.getIdToken())),
      switchMap(idToken => {
        // Send the token to the Spring Boot backend
        return this.http.post(`${this.baseUrl}/google`, idToken, {
          headers: {"Content-Type": "application/json"}
        });
      }),
      map(res => {
        console.log('Backend Google Login Response:', res);
        return res;
      }),
      tap(() => {
        this.loginSubject.next(true);
      })
    );
  }

  private handleAuthSuccess(res: any) {
    if (res?.role) {
      // res.role will be "USER" or "AGENCY" from your AuthResponse DTO
      this.userRole.set(res.role);
      localStorage.setItem('role', res.role);
    }
  }

  logout(): void {
    // this.auth.signOut();
    // localStorage.clear();
    // this.userRole.set('USER');

    //Clear backend/session-related storage
    localStorage.removeItem('idToken');
    localStorage.removeItem('uid');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    // Reset role signal
    this.userRole.set(UserRole.USER);

    // // Sign out from Firebase (Google login)
    this.afAuth.signOut().catch(() => {
      // ignore errors – user may not be logged in with Google
    });
    localStorage.clear();
    this.loginSubject.next(false);
  }
}

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

