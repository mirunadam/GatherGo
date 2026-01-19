import {Component, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {GoogleMapsModule} from "@angular/google-maps";
import {MatSelectModule} from "@angular/material/select";
import {CurrencyCode, currencyCodeItems} from "../../../shared-domain/currency-code-enum";
import {Location, NgClass, NgForOf, NgIf} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {PointDtoModel} from "../../../shared-domain/point-dto.model";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {TripService} from "../../services/trip.service";
import {TripDto} from "../../domain/trip.dto";
import {ActivatedRoute, Router} from "@angular/router";
import {FileUploadService} from "../../../services/file-upload.service";
import {MatIconModule} from "@angular/material/icon";
import {LoggedInContextService} from "../../../services/logged-in-context.service";
import {User} from "../../../shared-domain/user-data.model";
import {UserRole} from "../../../shared-domain/user-role.model";
import { forkJoin, Observable, of } from 'rxjs';


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
    MatIconModule,
    NgClass
  ],
  standalone: true,
  providers: [MatDatepickerModule]
})
export class TripFormComponent implements OnInit {
  center: google.maps.LatLngLiteral = { lat: 45.7558, lng: 21.2322};
  zoom = 12;
  location: google.maps.LatLngLiteral | null = null;
  currencyCodes = currencyCodeItems;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null | undefined = null;

  //Mara
  multipleFiles: File[] = [];
  multipleImagePreviewUrls: string[] = [];
  extraImages: string[] = [];



  editUuid: string | undefined = undefined;
  userData: User | undefined = undefined;

  tripForm = this.fb.group({
    location: [null as PointDtoModel | null, [Validators.required]],
    name: [null as string | null, [Validators.required]],
    ownerEmail: [null as string | null, [Validators.required]],
    dateStart: [null as Date | null, [Validators.required]],
    dateEnd: [null as Date | null, [Validators.required]],
    budget: [null as number | null, [Validators.required, Validators.min(0)]],
    currency: [null as CurrencyCode | null, [Validators.required]],
    maxPeople: [null as number | null, [Validators.min(0)]],
    itinerary: [null as string | null, []],
    accommodation: [null as string | null, []],
    accommodationSuggestions: [[] as string[]],
    isPublic: [false],
    participants: [[] as string[]]
  })

  constructor(private fb: FormBuilder, private tripService: TripService,
              private router: Router, private fileUploadService: FileUploadService,
              private routeLocation: Location, private activatedRoute: ActivatedRoute,
              private loggedInContext: LoggedInContextService) {}

  ngOnInit() {
    this.editUuid = this.activatedRoute.snapshot.queryParams['uuid'];
    this.loggedInContext.getUserData().subscribe((res) => {
      this.userData = res;
    });

    if(this.editUuid) {
      this.tripService.getTripByUuid(this.editUuid).subscribe((res) => {
        this.tripForm.patchValue({
          location: res.location,
          ownerEmail: res.ownerEmail,
          dateStart: res.dateStart,
          dateEnd: res.dateEnd,
          budget: res.budget,
          currency: res.currency,
          maxPeople: res.maxPeople,
          itinerary: res.itinerary,
          accommodation: res.accommodation,
          accommodationSuggestions: res.accommodationSuggestions ?? [],
          isPublic: res.isPublic,
          participants: res.participants
        })
        this.imagePreviewUrl = res.imageURL;
        this.extraImages=res.imageURLs ?? [];
        this.multipleImagePreviewUrls=[...this.extraImages];
        this.location = {
          lat: res.location?.latitude ?? 0,
          lng: res.location?.longitude ?? 0
        }
      })
    }
  }

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

  private createMainImageFormData(): FormData {
  const formData = new FormData();
  if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  }
  return formData;
}

  onSubmit() {
    this.tripForm.markAllAsTouched();
    this.tripForm.patchValue({
      ownerEmail: this.tripForm.value.ownerEmail ?? this.userData?.email
    })

    if(this.tripForm.invalid) {
      return;
    }

    const mainImage$: Observable<string | null> = this.selectedFile
    ? this.fileUploadService.uploadFile(this.createMainImageFormData())
    : of(this.imagePreviewUrl ?? null);

    const extraImages$ = this.uploadExtraPhotos();

    forkJoin([mainImage$, extraImages$]).subscribe({
      next: ([mainImageUrl, finalExtraImages]) => {
        this.submitForm(mainImageUrl,finalExtraImages);
      },
      error: err => {
        console.error('Upload failed', err);
      }
    });

  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if(this.selectedFile) {
      this.imagePreviewUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  //Mara
  onMultipleFilesSelected(event: any){
    const files: FileList=event.target.files;

    for(let i=0;i<files.length;i++){
      const file=files[i];
      this.multipleFiles.push(file);
      const url=URL.createObjectURL(file);
      this.multipleImagePreviewUrls.push(url);
    }
  }

  removePhoto(index: number){
    this.multipleFiles.splice(index,1);
    this.multipleImagePreviewUrls.splice(index,1);
    this.extraImages.splice(index,1);
  }

  private uploadExtraPhotos():Observable<string[]>{
      if (this.multipleFiles.length === 0) {
        return of(this.extraImages);
      }

      const observables = this.multipleFiles.map(file => {
        const formData = new FormData();
        formData.append('image', file);
        return this.fileUploadService.uploadFile(formData);
      });

      return forkJoin(observables);
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

  private submitForm(mainImageUrl: string | null, extraImages: string[] = []) {
    const trip: TripDto = {
      uuid: this.editUuid ?? crypto.randomUUID(),
      ownerEmail: this.tripForm.value.ownerEmail,
      name: this.tripForm.value.name,
      location: this.tripForm.value.location,
      dateStart: this.tripForm.value.dateStart,
      dateEnd: this.tripForm.value.dateEnd,
      budget: this.tripForm.value.budget,
      currency: this.tripForm.value.currency,
      maxPeople: this.tripForm.value.maxPeople,
      itinerary:  this.tripForm.value.itinerary,
      accommodation: this.tripForm.value.accommodation,
      accommodationSuggestions: this.tripForm.value.accommodationSuggestions ?? [],
      imageURL: mainImageUrl ?? this.imagePreviewUrl,
      imageURLs: extraImages ?? this.extraImages,
      isPublic: this.userData?.role === UserRole.AGENCY ? (this.tripForm.value.isPublic ?? false) : false,
      participants: this.tripForm.value.participants ?? []
    }

    this.tripService.createTrip(trip).subscribe(() => {
      this.router.navigate(['/trip']);
    });
  }

  goBack() {
    this.routeLocation.back();
  }

  protected readonly UserRole = UserRole;
}
