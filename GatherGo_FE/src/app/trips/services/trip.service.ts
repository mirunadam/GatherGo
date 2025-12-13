import { Injectable } from '@angular/core';
import {TripDto} from "../domain/trip.dto";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TripService {

  url = 'http://localhost:8080/api/trips'

  constructor(private http: HttpClient) {
  }

  public createTrip(trip: TripDto) {
    return this.http.post(this.url + '/create', trip);
  }
}
