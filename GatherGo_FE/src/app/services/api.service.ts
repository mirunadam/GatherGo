//shows us how to use HTTP Client
import { Injectable } from '@angular/core';
//creates one global instance
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private API_URL = 'http://localhost:8080/api/trips/testFirebase';
  //backend endpoint

  constructor(private http: HttpClient) { }

  //sends get requests
  getItems(): Observable<any> {
    return this.http.get(`${this.API_URL}`);
  }

  //sends post requests
  createItem(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/items`, data);
  }
}
