import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../services/profile.service';
import { TripService } from '../trips/services/trip.service';
import { TripDto } from '../trips/domain/trip.dto';
import { interval, Subscription, map, of, switchMap, tap, throwError } from 'rxjs';

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

    this.refreshSub = interval(15000).subscribe(() => this.refreshTrip());
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

    this.getUserEmail$()
      .pipe(switchMap(email => this.tripService.addParticipantToTrip(tripUuid, email)))
      .subscribe({
        next: (updatedTrip) => {
          // ✅ best: use backend response as source of truth
          this.trip = updatedTrip;
        },
        error: (err) => {
          console.error('Failed to join trip', err);
          this.errorMsg = 'Failed to join trip.';
        }
      });
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

    this.getUserEmail$()
      .pipe(switchMap(email => this.tripService.addItineraryItem(this.trip!.uuid, email, line)))
      .subscribe({
        next: (updatedTrip) => {
          this.trip = updatedTrip;
          this.refreshTrip();
          // this.newActivity = '';
          // this.showActivityForm = false;
        },
        error: (err) => {
          console.error('Failed to save activity', err);
          if (this.trip) this.trip.itinerary = previous;
          this.errorMsg = 'Failed to save activity.';
        }
      });
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


    this.getUserEmail$()
      .pipe(switchMap(email => this.tripService.addAccommodation(this.trip!.uuid, email, item)))
      .subscribe({
        next: (updatedTrip) => {
          this.trip = updatedTrip;
          // this.newAccommodation = '';
          // this.showAccommodationForm = false;
        },
        error: (err) => {
          console.error('Failed to add accommodation suggestion', err);
          if (this.trip) {
            this.trip.accommodationSuggestions = prev;
          }
          this.errorMsg = 'Failed to add accommodation suggestion';
        }
      });
  }

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
