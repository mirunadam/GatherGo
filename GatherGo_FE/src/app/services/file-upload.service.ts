import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  baseUrl = 'http://localhost:8080/api/images/upload';

  constructor(private http: HttpClient) { }

  uploadFile(data: FormData) {
    return this.http.post(this.baseUrl, data, { responseType: 'text' });
  }
}
