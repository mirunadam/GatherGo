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

  public getAllTrips() {
    return this.http.get<TripDto[]>(this.url);
  }

  public getAllTripsByOwner(ownerEmail: string ) {
    return this.http.get<TripDto[]>(this.url + `/byOwner/${ownerEmail}`)
  }

  public getTripByUuid(uuid: string) {
    return this.http.get<TripDto>(this.url + `/${uuid}`);
  }

  public addParticipantToTrip(tripUuid: string, participantEmail: string) {
    return this.http.post<TripDto>(this.url + `/addParticipant`,
      null,
      {
        params: {
          uuid: tripUuid, email: participantEmail
        }
      });
  }

  public createTrip(trip: TripDto) {
    return this.http.post(this.url + '/create', trip);
  }
}
