import { Component, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TripService } from '../trips/services/trip.service';
import { TripDto } from '../trips/domain/trip.dto';           
import { AppModule } from '../app.module';
import { NavigationModule } from '../navigation/navigation.module';

export interface Activity {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
}

export interface Accommodation {
  id: string;
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  price: number;
}

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavigationModule],
  templateUrl: './trip-details.component.html',
})
export class TripDetailsComponent implements OnInit {
  trip: TripDto | null = null;

  // if you have user context later, wire it like colleagues do with LoggedInContextService
  userId: string | null = null;

  isLoading = true;
  errorMsg: string | null = null;

  activeTab: 'overview' | 'activities' | 'accommodations' | 'photos' | 'participants' = 'overview';

  activities: Activity[] = [];
  accommodations: Accommodation[] = [];
  photos: any[] = [];
  likedPhotos = new Set<string>();

  showActivityForm = false;
  showAccommodationForm = false;

  newActivity: Activity = { id: '', name: '', description: '', date: '', time: '' };

  newAccommodation: Accommodation = {
    id: '',
    name: '',
    address: '',
    checkIn: '',
    checkOut: '',
    price: 0,
  };

  private geocoder = new google.maps.Geocoder();

  locationName = 'Loading location...';

  mockParticipants = [ { id: '1', name: 'Demo User', email: 'demo@example.com' }, { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' }, { id: '3', name: 'Mike Chen', email: 'mike@example.com' }, ];

  tabs: ('overview' | 'activities' | 'accommodations' | 'photos' | 'participants')[] = [
    'overview',
    'activities',
    'accommodations',
    'photos',
    'participants',
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private tripService: TripService
  ) {}

  ngOnInit() {
    this.userId = localStorage.getItem('email'); // or your real user id if you have one
    this.loadTrip();
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
      next: (res:any) => {
        this.trip = res;

        // These fields exist in TripForm -> TripDto:
        // itinerary, accommodation, imageURL, imageURLs, dateStart/dateEnd, etc.
        // Your Activity/Accommodation/Photos are currently not part of TripDto based on the shown code,
        // so default to empty arrays.
        this.activities = (res as any)?.activities ?? [];
        this.accommodations = (res as any)?.accommodations ?? [];
        this.photos = (res as any)?.photos ?? [];
        this.locationName = this.getLocationLabel(res);
        // likes logic only if you really have likes + a user id
        this.likedPhotos.clear();
        if (this.userId) {
          this.photos.forEach((p: any) => {
            if (p?.likes?.includes(this.userId)) {
              this.likedPhotos.add(p.id);
            }
          });
        }

        this.isLoading = false;
      },
      error: (err:any) => {
        console.error('Failed to load trip', err);
        this.trip = null;
        this.activities = [];
        this.accommodations = [];
        this.photos = [];
        this.likedPhotos.clear();

        this.isLoading = false;
        this.errorMsg = 'Failed to load trip details (check backend, URL, and CORS).';
      },
    });
  }

  goBack() {
    this.location.back();
  }

  addActivity() {
    this.activities.push({ ...this.newActivity, id: Date.now().toString() });
    this.newActivity = { id: '', name: '', description: '', date: '', time: '' };
    this.showActivityForm = false;
  }

  addAccommodation() {
    this.accommodations.push({ ...this.newAccommodation, id: Date.now().toString() });
    this.newAccommodation = { id: '', name: '', address: '', checkIn: '', checkOut: '', price: 0 };
    this.showAccommodationForm = false;
  }

  toggleLike(photoId: string) {
    this.likedPhotos.has(photoId) ? this.likedPhotos.delete(photoId) : this.likedPhotos.add(photoId);
  }

  joinTrip(tripUuid: string) {
    const email = localStorage.getItem('email');
    if(email) {
      this.tripService.addParticipantToTrip(tripUuid, email).subscribe((res) => {
        console.log(res);
      });
    }
  }

  private getLocationLabel(trip: TripDto): string {
  const lat = trip.location?.latitude;
  const lng = trip.location?.longitude;

  if (lat == null || lng == null) return 'Online / TBD';

  // Start with coords while we reverse-geocode async
  this.locationName = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  const latLng = { lat, lng };
  this.geocoder.geocode({ location: latLng }, (results, status) => {
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

    if (
      !city &&
      (types.includes('locality') ||
        types.includes('postal_town') ||
        types.includes('administrative_area_level_2'))
    ) {
      city = component.long_name;
    }

    if (!country && types.includes('country')) {
      country = component.long_name;
    }
  }

  return city ? `${city}, ${country}` : country || 'Unknown location';
}

}
