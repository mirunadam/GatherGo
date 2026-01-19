import {Component, OnInit} from '@angular/core';
import {TripService} from "../services/trip.service";
import {TripDto} from "../domain/trip.dto";
import {NgForOf} from "@angular/common";
import {TripViewCardComponent} from "./trip-view-card/trip-view-card.component";
import {MatButtonModule} from "@angular/material/button";
import {Router} from "@angular/router";

@Component({
  selector: 'app-feature-trip-list',
  templateUrl: './feature-trip-list.component.html',
  styleUrls: ['./feature-trip-list.component.scss'],
  standalone: true,
  imports: [
    NgForOf,
    TripViewCardComponent,
    MatButtonModule,
  ]
})
export class FeatureTripListComponent implements OnInit{
  geocoder = new google.maps.Geocoder;
  tripsWithCity: {trip: TripDto, city: string}[] = [];

  constructor(private tripService: TripService, private router: Router) {

  }

  ngOnInit() {
    const email = localStorage.getItem('email');

    this.tripService.getAllTrips().subscribe((res) => {
        this.tripsWithCity = res.map((trip) => {
          return {
            trip: trip,
            city: ''
          }
        });

      this.tripsWithCity = this.tripsWithCity.map((tripWithCity) => {
          const location = {lat: tripWithCity.trip.location?.latitude ?? 0, lng: tripWithCity.trip.location?.longitude ?? 0};
          this.geocoder.geocode({ location: location}, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              tripWithCity.city = this.extractCityAndCountry(results[0])
            }
          });
          return tripWithCity;
        })

        console.log(this.tripsWithCity);

      this.tripsWithCity = this.tripsWithCity.filter((tripWithCity) => {
        return tripWithCity.trip.isPublic || tripWithCity.trip.ownerEmail === email
      })
    })
  }

  private extractCityAndCountry(result: google.maps.GeocoderResult) {
    let city: string | null = null;
    let country: string | null = null;

    for (const component of result.address_components) {
      const types = component.types;

      if (!city) {
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('postal_town')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_2')) {
          city = component.long_name;
        }
      }

      if (!country && types.includes('country')) {
        country = component.long_name;
      }
    }

    return city + ", " + country;
  }

  trackByUuid(index: number, tripWithAddress: {trip: TripDto, city: string}) {
    return tripWithAddress.trip.uuid
  }

  goToCreateTrips() {
    this.router.navigate(['trip/form']);
  }

  goToEdit($event: string | undefined) {
    this.router.navigate(['trip/form'], {
      queryParams: {
        uuid: $event
      }
    })
  }
}
