import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../services/profile.service';
import { TripService } from '../trips/services/trip.service';
import { TripDto } from '../trips/domain/trip.dto';
import { interval, Subscription, map, of, switchMap, tap, throwError } from 'rxjs';
import { FileUploadService } from '../services/file-upload.service';
import { forkJoin, Observable} from 'rxjs';

type Tab = 'overview' | 'activities' | 'accommodations' | 'photos' | 'participants';

/** Only used for the form (NOT stored as an array anymore) */
// interface ActivityForm {
//   name: string;
//   description: string;
//   date: string;
//   time: string;
// }

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './trip-details.component.html',
})
export class TripDetailsComponent implements OnInit, OnDestroy {
  trip: TripDto | null = null;

  isLoading = true;
  errorMsg: string | null = null;

  activeTab: Tab = 'overview';
  tabs: Tab[] = ['overview', 'activities', 'accommodations', 'photos', 'participants'];

  // UI state
  showActivityForm = false;
  showAccommodationForm = false;

  // form model (single item)
  newActivity: string = '';  //ActivityForm = { name: '', description: '', date: '', time: '' };
  newAccommodation: string = '';

  photos: any[] = [];
  likedPhotos = new Set<string>();

  // auth
  isLoggedIn = false;
  userName: string | null = null;
  userEmail: string | null = null;

  private refreshSub?: Subscription;
  private geocoder = new google.maps.Geocoder();
  locationName = 'Loading location...';

  mockParticipants = [
    { id: '1', name: 'Demo User', email: 'demo@example.com' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: '3', name: 'Mike Chen', email: 'mike@example.com' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private tripService: TripService,
    private profileService: ProfileService,
    private fileUploadService: FileUploadService,
  ) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.loadTrip();

    if (this.isLoggedIn) {
      const uid = localStorage.getItem('uid');
      if (uid) {
        this.profileService.getUser(uid).subscribe({
          next: (data: any) => {
            this.userName = data.username || data.fullname;
            localStorage.setItem('username', this.userName || '');
            this.userEmail = data.email || null;
          }
        });
      }
    }

    //this.refreshSub = interval(15000).subscribe(() => this.refreshTrip());
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  private loadTrip() {
    this.isLoading = true;
    this.errorMsg = null;

    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (!uuid) {
      this.isLoading = false;
      this.errorMsg = 'Missing trip uuid in URL. Expected /trip/:uuid';
      return;
    }

    this.tripService.getTripByUuid(uuid).subscribe({
      next: (res: any) => {
        this.trip = res;

        this.photos = (res as any)?.photos ?? [];
        this.locationName = this.getLocationLabel(res);

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load trip', err);
        this.trip = null;
        this.photos = [];
        this.likedPhotos.clear();

        this.isLoading = false;
        this.errorMsg = 'Failed to load trip details (check backend, URL, and CORS).';
      },
    });
  }

  private refreshTrip() {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (!uuid) return;

    this.tripService.getTripByUuid(uuid).subscribe({
      next: (res: any) => {
        this.trip = res;
        this.locationName = this.getLocationLabel(res);
      },
      error: (err) => console.error('Failed to refresh trip', err),
    });
  }

  goBack() {
    this.location.back();
  }

  checkLoginStatus(): void {
    this.userEmail = localStorage.getItem('email');
    this.userName = localStorage.getItem('username');
    this.isLoggedIn = !!localStorage.getItem('idToken');
  }

  private getUserEmail$() {
    if (this.userEmail) return of(this.userEmail);

    const uid = localStorage.getItem('uid');
    if (!uid) return throwError(() => new Error('No uid in localStorage'));

    return this.profileService.getUser(uid).pipe(
      map((data: any) => data.email as string),
      tap(email => {
        this.userEmail = email;
        localStorage.setItem('email', email);
      })
    );
  }

  joinTrip(tripUuid: string) {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (!this.trip) return;

    this.getUserEmail$().subscribe({
      next: (email) => {
        const prev = [...(this.trip!.participants ?? [])];

        const alreadyIn =
          this.trip!.ownerEmail?.toLowerCase() === email.toLowerCase() ||
          (this.trip!.participants ?? []).some(p => p.toLowerCase() === email.toLowerCase());

        if (!alreadyIn) {
          (this.trip!.participants ??= []).push(email);
        }

        this.errorMsg = null;

        this.tripService.addParticipantToTrip(tripUuid, email).subscribe({
          next: (updatedTrip) => {
            this.trip = updatedTrip;

            //force refresh from DB to be 100% sure
            this.refreshTrip();
          },
          error: (err) => {
            console.error('Failed to join trip', err);
            //revert optimistic update if backend fails
            if (this.trip) this.trip.participants = prev;

            this.errorMsg = 'Failed to join trip.';
          }
        });
      },
      error: (err) => {
        console.error('Could not resolve user email', err);
        this.errorMsg = 'Could not resolve user email.';
      }
    });

    // this.getUserEmail$()
    //   .pipe(switchMap(email => this.tripService.addParticipantToTrip(tripUuid, email)))
    //   .subscribe({
    //     next: (updatedTrip) => {
    //       this.trip = updatedTrip;
    //     },
    //     error: (err) => {
    //       console.error('Failed to join trip', err);
    //       this.errorMsg = 'Failed to join trip.';
    //     }
    //   });
  }

  addActivity() {
    if (!this.trip) return;

    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    const line = this.newActivity.trim();
    if (!line) return;
    
     const previous = this.trip.itinerary || '';
      this.trip.itinerary = previous.trim()
        ? `${previous}\n${line}`
        : line;

      // clear UI immediately too
      this.newActivity = '';
      this.showActivityForm = false;
      this.errorMsg = null;

      this.trip.itinerary=this.trip.itinerary.concat(this.newActivity);
      console.log(this.trip.itinerary);

     this.tripService.createTrip(this.trip).subscribe({
        next: (saved: any) => {
          this.trip = saved;
        },
        error: (err) => {
          console.error('Failed to save activity', err);
          if (this.trip) this.trip.itinerary = previous;
          this.errorMsg = 'Failed to save activity.';
        }
      });
    // this.getUserEmail$()
    //   .pipe(switchMap(email => this.tripService.addItineraryItem(this.trip!.uuid, email, line)))
    //   .subscribe({
    //     next: (updatedTrip) => {
    //       this.trip = updatedTrip;
    //       this.refreshTrip();
    //       // this.newActivity = '';
    //       // this.showActivityForm = false;
    //     },
    //     error: (err) => {
    //       console.error('Failed to save activity', err);
    //       if (this.trip) this.trip.itinerary = previous;
    //       this.errorMsg = 'Failed to save activity.';
    //     }
    //   });
  }

  isMember(t: TripDto): boolean {
    if (!this.userEmail) return false;
    return t.ownerEmail?.toLowerCase() === this.userEmail.toLowerCase()
      || (t.participants ?? []).some(p => p.toLowerCase() === this.userEmail!.toLowerCase());
  }

  addAccommodation() {
    if (!this.trip) return;

    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const item = this.newAccommodation.trim();
    if (!item) return;

    const prev = [...(this.trip.accommodationSuggestions ?? [])];
    (this.trip.accommodationSuggestions ??= []).push(item);

    this.newAccommodation = '';
    this.showAccommodationForm = false;
    this.errorMsg = null;

    //this.trip.accommodationSuggestions = this.trip.accommodationSuggestions.concat(this.newAccommodation);
    console.log(this.trip.accommodationSuggestions);

    this.tripService.createTrip(this.trip).subscribe({
    next: (saved: any) => {
      this.trip = saved;
    },
    error: (err) => {
      console.error('Failed to save accommodation', err);
      if (this.trip) this.trip.accommodationSuggestions = prev;
      this.errorMsg = 'Failed to save accommodation.';
    }
  });

  }
    // this.getUserEmail$()
    //   .pipe(switchMap(email => this.tripService.addAccommodation(this.trip!.uuid, email, item)))
    //   .subscribe({
    //     next: (updatedTrip) => {
    //       this.trip = updatedTrip;
    //       // this.newAccommodation = '';
    //       // this.showAccommodationForm = false;
    //     },
    //     error: (err) => {
    //       console.error('Failed to add accommodation suggestion', err);
    //       if (this.trip) {
    //         this.trip.accommodationSuggestions = prev;
    //       }
    //       this.errorMsg = 'Failed to add accommodation suggestion';
    //     }
    //   });

    // showPhotoForm = false;
    // newPhotoUrl = '';

    // multipleFiles: File[] = [];
    // multipleImagePreviewUrls: string[] = [];

//   onMultipleFilesSelected(event: any) {
//     const files: FileList = event.target.files;

//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
//       this.multipleFiles.push(file);
//       this.multipleImagePreviewUrls.push(URL.createObjectURL(file));
//     }
//   }

//     removeSelectedPhoto(index: number) {
//       this.multipleFiles.splice(index, 1);
//       this.multipleImagePreviewUrls.splice(index, 1);
//     }

//   private uploadExtraPhotosFromDetails(): Observable<string[]> {
//   if (this.multipleFiles.length === 0) {
//     return of([]);
//   }

//   const uploads = this.multipleFiles.map(file => {
//     const formData = new FormData();
//     formData.append('image', file);
//     return this.fileUploadService.uploadFile(formData); // returns Observable<string>
//   });

//   return forkJoin(uploads);
// }

// private saveImageUrlsToTrip(uuid: string, email: string, urls: string[]): Observable<TripDto> {
//   if (urls.length === 0) {
//     // nothing to save -> just return current trip as observable
//     return of(this.trip!);
//   }

//   // call addImageUrl for each url, and take the last updated TripDto as final result
//   const calls = urls.map(u => this.tripService.addImageUrl(uuid, email, u));
//   return forkJoin(calls).pipe(
//     // forkJoin returns TripDto[] (one per call), take the last one
//     switchMap((results) => of(results[results.length - 1]))
//   );
// }

  // selectedFile: File | null = null;
  // imagePreviewUrl: string | null | undefined = null;

  //Mara
  multipleFiles: File[] = [];
  multipleImagePreviewUrls: string[] = [];
  extraImages: string[] = [];

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

  isUploadingPhotos = false;

  uploadPhotos(){
    if (this.multipleFiles.length === 0) {
        return;
    }
    
    this.multipleFiles.forEach((file) => {
      const formData = new FormData();
      formData.append('image', file);
      this.fileUploadService.uploadFile(formData).pipe(tap(()=>{this.isUploadingPhotos = true})).subscribe(response => {
        this.trip?.imageURLs?.push(response);
        console.log(response)
        this.isUploadingPhotos = false;
        this.tripService.createTrip(this.trip!).subscribe();
      });
    })
  }

  // uploadPhotoss() {
    // const formData = new FormData();
    // if(this.selectedFile) {
    //   formData.append('image', this.selectedFile);

  //     this.fileUploadService.uploadFile(formData).pipe(tap(()=>{this.isUploadingPhotos = true})).subscribe(response => {
  //       this.trip?.imageURLs?.push(response);
  //       this.isUploadingPhotos = false;
  //     });
  //   }
  //   this.tripService.createTrip(this.trip!);
  // }


  // uploadPhotosToTrip() {
  // if (!this.trip) return;

  // if (!this.isLoggedIn) {
  //   this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  //   return;
  // }

  // this.isUploadingPhotos = true;
  // this.errorMsg = null;

  // const uuid = this.trip.uuid;



  // this.getUserEmail$().pipe(
  //   switchMap(email =>
  //     this.uploadExtraPhotosFromDetails().pipe(
  //       switchMap((uploadedUrls) => {
  //         // ✅ optimistic UI update (instant)
  //         const prev = [...(this.trip!.imageURLs ?? [])];
  //         const newList = [...prev, ...uploadedUrls];
  //         this.trip!.imageURLs = newList;

  //         // clear selection UI immediately
  //         this.multipleFiles = [];
  //         this.multipleImagePreviewUrls = [];

  //         // save each url in backend
  //         return this.saveImageUrlsToTrip(uuid, email, uploadedUrls).pipe(
  //           // if backend fails, revert
  //           // NOTE: if you want per-url revert, we can do that too
  //           // but this is simplest and matches your pattern
  //           // (if it errors, we restore prev list)
  //           // handled in error below
  //         );
  //       })
  //     )
  //   )
  // ).subscribe({
  //   next: (updatedTrip) => {
  //     this.trip = updatedTrip;      // backend truth
  //     this.isUploadingPhotos = false;
  //     // optional: refreshTrip() if you want extra safety
  //     // this.refreshTrip();
  //   },
  //   error: (err) => {
  //     console.error('Failed to upload/save photos', err);
  //     this.isUploadingPhotos = false;
  //     this.errorMsg = 'Failed to upload photos.';
  //     // if you want perfect revert, store prev before optimistic update
  //     // (tell me if you want per-url revert)
  //     this.refreshTrip(); // simplest revert: reload from server
  //   }
  // });
//}
  // addPhotoUrl() {
  //   if (!this.trip) return;

  //   if (!this.isLoggedIn) {
  //     this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  //     return;
  //   }

  //   const url = this.newPhotoUrl.trim();
  //   if (!url) return;

  //   // optimistic UI update
  //   const prev = [...(this.trip.imageURLs ?? [])];
  //   const already = (this.trip.imageURLs ?? []).some(u => u.trim().toLowerCase() === url.toLowerCase());
  //   if (!already) (this.trip.imageURLs ??= []).push(url);

  //   this.newPhotoUrl = '';
  //   this.showPhotoForm = false;
  //   this.errorMsg = null;

  //   this.getUserEmail$()
  //     .pipe(switchMap(email => this.tripService.addImageUrl(this.trip!.uuid, email, url)))
  //     .subscribe({
  //       next: (updatedTrip) => {
  //         this.trip = updatedTrip; // backend truth
  //         this.refreshTrip();      // optional: force reload
  //       },
  //       error: (err) => {
  //         console.error('Failed to add image url', err);
  //         if (this.trip) this.trip.imageURLs = prev; // revert
  //         this.errorMsg = 'Failed to add image url.';
  //       }
  //     });
  // }

  toggleLike(photoId: string) {
    this.likedPhotos.has(photoId) ? this.likedPhotos.delete(photoId) : this.likedPhotos.add(photoId);
  }

  private getLocationLabel(trip: TripDto): string {
    const lat = trip.location?.latitude;
    const lng = trip.location?.longitude;
    if (lat == null || lng == null) return 'Online / TBD';

    this.locationName = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        this.locationName = this.extractCityAndCountry(results[0]);
      } else {
        this.locationName = 'Unknown location';
      }
    });

    return this.locationName;
  }

  private extractCityAndCountry(result: google.maps.GeocoderResult): string {
    let city = '';
    let country = '';

    for (const component of result.address_components) {
      const types = component.types;

      if (!city && (types.includes('locality') || types.includes('postal_town') || types.includes('administrative_area_level_2'))) {
        city = component.long_name;
      }
      if (!country && types.includes('country')) {
        country = component.long_name;
      }
    }

    return city ? `${city}, ${country}` : country || 'Unknown location';
  }
}
