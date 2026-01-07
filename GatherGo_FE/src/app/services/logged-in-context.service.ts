import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "../shared-domain/user-data.model";
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class LoggedInContextService {
  private baseUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient, private auth: Auth) {}

  getUserData() {
    const token = localStorage.getItem('idToken');

    if(!token) {
      throw new Error("No user logged in!");
    }

    return this.http.get<User>(
      this.baseUrl + '/getUserInfo',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
}
