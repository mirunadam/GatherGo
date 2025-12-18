import {Component} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {GoogleMapsModule} from "@angular/google-maps";
import {MatSelectModule} from "@angular/material/select";
import {CurrencyCode, currencyCodeItems} from "../../../shared-domain/currency-code-enum";
import {Location, NgForOf, NgIf} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {PointDtoModel} from "../../../shared-domain/point-dto.model";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {TripService} from "../../services/trip.service";
import {TripDto} from "../../domain/trip.dto";
import {Router} from "@angular/router";
import {FileUploadService} from "../../../services/file-upload.service";
import {MatIconModule} from "@angular/material/icon";

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
    MatIconModule
  ],
  standalone: true,
  providers: [MatDatepickerModule]
})
export class TripFormComponent {
  center: google.maps.LatLngLiteral = { lat: 45.7558, lng: 21.2322};
  zoom = 12;
  location: google.maps.LatLngLiteral | null = null;
  currencyCodes = currencyCodeItems;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;

  constructor(private fb: FormBuilder, private tripService: TripService,
              private router: Router, private fileUploadService: FileUploadService,
              private routeLocation: Location) {}

  tripForm = this.fb.group({
    location: [null as PointDtoModel | null, [Validators.required]],
    dateStart: [null as Date | null, [Validators.required]],
    dateEnd: [null as Date | null, [Validators.required]],
    budget: [null as number | null, [Validators.required], Validators.min(0)],
    currency: [null as CurrencyCode | null, [Validators.required]],
    maxPeople: [null as number | null, [Validators.min(0)]],
    itinerary: [null as string | null, []],
    accommodation: [null as string | null, []]
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

    if(this.selectedFile) {
      this.upload();
    }
    else {
      this.submitForm(null);
    }

  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if(this.selectedFile) {
      this.imagePreviewUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  private upload() {
    const formData = new FormData();
    if(this.selectedFile) {
      formData.append('image', this.selectedFile);

      this.fileUploadService.uploadFile(formData).subscribe(response => {
        this.submitForm(response);
      });
    }
  }

  private submitForm(response: string | null) {
    const trip: TripDto = {
      uuid: crypto.randomUUID(),
      location: this.tripForm.value.location,
      dateStart: this.tripForm.value.dateStart,
      dateEnd: this.tripForm.value.dateEnd,
      budget: this.tripForm.value.budget,
      currency: this.tripForm.value.currency,
      maxPeople: this.tripForm.value.maxPeople,
      itinerary: this.tripForm.value.itinerary,
      accommodation: this.tripForm.value.accommodation,
      imageURL: response
    }

    this.tripService.createTrip(trip).subscribe(() => {
      this.router.navigate(['/trip']);
    });
  }

  goBack() {
    this.routeLocation.back();
  }
}
