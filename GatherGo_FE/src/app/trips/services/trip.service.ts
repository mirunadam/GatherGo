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

  public getAllPublicTrips() {
    return this.http.get<TripDto[]>(this.url + `/public`);
  }

  public getAllSpecificTrips(email: string) {
    return this.http.get<TripDto[]>(this.url + `/specific/${email}`);
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

    addItineraryItem(uuid: string, email: string, item: string) {
    return this.http.post<TripDto>(
      `${this.url}/addItineraryItem`,
      null,
      { params: { uuid, email, item } }
    );
  }

  addAccommodation(uuid: string, email: string, item: string) {
    return this.http.post<TripDto>(
      `${this.url}/addAccommodation`,
      null,
      { params: { uuid, email, item } }
    );
  }

  addImageUrl(uuid: string, email: string, url: string){
      return this.http.post<TripDto>(
    `${this.url}/addImageUrl`,
    null,
    { params: { uuid, email, url } }
  );
  }

  public createTrip(trip: TripDto) {
    return this.http.post(this.url + '/create', trip);
  }

  public addParticipant(tripUuid: string, email: string) {
  return this.http.post(
    this.url + `/addParticipant?uuid=${tripUuid}&email=${email}`,
    null
  );
}

}
