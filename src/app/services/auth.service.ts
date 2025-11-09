import { Injectable } from '@angular/core';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { FirebaseApp } from '@angular/fire/app';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth(inject(FirebaseApp));

  // Login with email/password
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Register new user
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // Logout
  logout() {
    return signOut(this.auth);
  }

  // Get Firebase ID token for backend
  async getIdToken(): Promise<string | null> {
    const user: User | null = this.auth.currentUser;
    return user ? user.getIdToken() : null;
  }
}