import {Component, OnInit} from '@angular/core';
import {TripService} from "../services/trip.service";
import {TripDto} from "../domain/trip.dto";
import {JsonPipe, NgForOf} from "@angular/common";

@Component({
  selector: 'app-feature-trip-list',
  templateUrl: './feature-trip-list.component.html',
  styleUrls: ['./feature-trip-list.component.scss'],
  standalone: true,
  imports: [
    NgForOf,
    JsonPipe
  ]
})
export class FeatureTripListComponent implements OnInit{
  trips: TripDto[] = [];

  constructor(private tripService: TripService) {

  }

  ngOnInit() {
    this.tripService.getAllTrips().subscribe((res) => {
        this.trips = res;
    })
  }

  trackByUuid(index: number, trip: TripDto) {
    return trip.uuid
  }
}
