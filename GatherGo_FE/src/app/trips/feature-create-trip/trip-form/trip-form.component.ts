import {Component} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {GoogleMapsModule} from "@angular/google-maps";
import {MatSelectModule} from "@angular/material/select";
import {CurrencyCode, currencyCodeItems} from "../../../shared-domain/currency-code-enum";
import {NgForOf, NgIf} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {PointDtoModel} from "../../../shared-domain/point-dto.model";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {TripService} from "../../services/trip.service";
import {TripDto} from "../../domain/trip.dto";
import {Router} from "@angular/router";

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    GoogleMapsModule,
    MatSelectModule,
    NgForOf,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatButtonModule,
    NgIf,
  ],
  standalone: true,
  providers: [MatDatepickerModule]
})
export class TripFormComponent {
  center: google.maps.LatLngLiteral = { lat: 45.7558, lng: 21.2322};
  zoom = 12;
  location: google.maps.LatLngLiteral | null = null;
  currencyCodes = currencyCodeItems;

  constructor(private fb: FormBuilder, private tripService: TripService,
              private router: Router) {

  }

  tripForm = this.fb.group({
    location: [null as PointDtoModel | null, [Validators.required]],
    dateStart: [null as Date | null, [Validators.required]],
    dateEnd: [null as Date | null, [Validators.required]],
    budget: [null as number | null, [Validators.required], Validators.min(0)],
    currency: [null as CurrencyCode | null, [Validators.required]],
    maxPeople: [null as number | null, [Validators.required, Validators.min(0)]]
  })

  setLocation($event: any) {
    this.location = {
      lat: $event.latLng.lat(),
      lng: $event.latLng.lng()
    }
    this.tripForm.patchValue({
      location: {
        latitude: $event.latLng.lat(),
        longitude: $event.latLng.lng()
      }
    })
  }

  onSubmit() {
    this.tripForm.markAllAsTouched();

    if(this.tripForm.invalid) {
      return;
    }

    const trip: TripDto = {
      uuid: crypto.randomUUID(),
      location: this.tripForm.value.location,
      dateStart: this.tripForm.value.dateStart,
      dateEnd: this.tripForm.value.dateEnd,
      budget: this.tripForm.value.budget,
      currency: this.tripForm.value.currency,
      maxPeople: this.tripForm.value.maxPeople
    }

    this.tripService.createTrip(trip).subscribe(() => {
      this.router.navigate(['']);
    });
  }
}
