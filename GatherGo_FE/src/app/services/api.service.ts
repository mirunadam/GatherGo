import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private API_URL = 'http://localhost:8080/api/trips/testFirebase'; // backend base URL

  constructor(private http: HttpClient) { }

  // Example: GET all items
  getItems(): Observable<any> {
    return this.http.get(`${this.API_URL}`);
  }

  // Example: POST data
  createItem(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/items`, data);
  }
}
