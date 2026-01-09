import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "../shared-domain/user-data.model";
import { Auth } from '@angular/fire/auth';
//sees who is now currently logged in 
@Injectable({
  providedIn: 'root',
})
export class LoggedInContextService {
  private baseUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient, private auth: Auth) {}

  getUserData() {
    //reads from local storage
    const token = localStorage.getItem('idToken');

    if(!token) {
      throw new Error("No user logged in!");
    }

    //Calls backend /auth/getUserInfo
    //this maps directly to getUserInfo
    return this.http.get<User>(
      this.baseUrl + '/getUserInfo',
      {
        headers: {
          //Sends it as Authorization: Bearer <token>
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
}
