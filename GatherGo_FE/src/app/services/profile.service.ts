import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = 'http://localhost:8080/profile';

  constructor(private http: HttpClient) { }

  getUser(uid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${uid}`);
  }

  updateUser(profileData: any): Observable<string> {
    return this.http.put(`${this.baseUrl}/update`, profileData, { responseType: 'text' });
  }
}