import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

  register(data: RegisterPayload): Observable<string> {
    return this.http.post(`${this.baseUrl}/register`, data, { responseType: 'text' });
  }

  login(data: LoginPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
}
