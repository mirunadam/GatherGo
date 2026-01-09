import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = 'http://localhost:8080/profile';

  constructor(private http: HttpClient) { }

  //get /profile/{uid}
  getUser(uid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${uid}`);
  }

  //put /profile/update
  updateUser(profileData: any): Observable<string> {
    return this.http.put(`${this.baseUrl}/update`, profileData, { responseType: 'text' });
  }
}