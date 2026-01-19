import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { TripService } from '../trips/services/trip.service';
import { TripDto } from '../trips/domain/trip.dto';
//import { NavigationModule } from '../navigation/navigation.module';
// import { NgFor, NgIf } from '@angular/common';
// import { NgModel } from '@angular/forms';
// import { NgClass } from '@angular/common';
// import { FormsModule } from '@angular/forms'

// The simple interface your Landing Page HTML expects
interface FrontendTrip {
  id: string;
  name: string;
  location: string;
  agency: string;
  price: number;
  period: string;
  imageUrl: string;
}

// Keep static trips for demo/fallback
const STATIC_TRIPS: FrontendTrip[] = [
  {
    id: 'mock-1',
    name: 'Tropical Paradise Getaway',
    location: 'Maldives',
    agency: 'Paradise Travel Co.',
    price: 2499,
    period: 'Dec 15 - Dec 22',
    imageUrl: 'https://images.unsplash.com/photo-1660315250109-075f6b142ebc?auto=format&fit=crop&w=1080&q=80',
  },
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  // standalone: true,
  // imports: [
  //   NgFor,
  //   NgIf,
  //   FormsModule,
  // ],
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  
  // Google Maps Geocoder
  private geocoder = new google.maps.Geocoder();


  // State
  searchTerm: string = '';
  locationFilter: string = '';
  agencyFilter: string = '';
  allTrips: FrontendTrip[] = [...STATIC_TRIPS]; // Start with static
  isLoggedIn = false;
  userName: string | null = null;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private tripService: TripService
  ) { }

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadRealTrips(); // Load your database trips

    if (this.isLoggedIn) {
      const uid = localStorage.getItem('uid');
      if (uid) {
        this.profileService.getUser(uid).subscribe({
            next: (data) => {
                this.userName = data.username || data.fullname;
                localStorage.setItem('username', this.userName || '');
            }
        });
      }
    }
  }

  loadRealTrips(): void {
    // 1. Fetch Real Trips from Backend
    this.tripService.getAllPublicTrips().subscribe({
      next: (dtos: TripDto[]) => {
        // 2. Convert Backend DTOs to Frontend UI Models
        const mappedTrips = dtos.map(dto => this.mapTripDtoToFrontendModel(dto));

        // 3. Combine them (Real trips first, then static ones)
        this.allTrips = [...mappedTrips, ...STATIC_TRIPS];
      },
      error: (err) => console.error('Failed to load trips', err)
    });
  }

  private mapTripDtoToFrontendModel(dto: TripDto): FrontendTrip {

    // Create the base object
    // const frontendTrip: FrontendTrip = {
    //   id: dto.uuid,
    //   name: 'Unnamed Adventure', // Use itinerary as name fallback
    //   location: 'Loading location...', // Placeholder while geocoding runs
    //   agency: 'Community Trip', 
    //   price: dto.budget || 0,
    //   period: this.formatDatePeriod(dto.dateStart, dto.dateEnd),
    //   imageUrl: dto.imageURL || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1080&q=80' // Default image
    // };
    // const itineraryArray: string[] = Array.isArray(dto.itinerary)
    // ? dto.itinerary : [];
    // : (typeof dto.itinerary === 'string' && dto.itinerary.trim()
    //     ? dto.itinerary.split('\n').map(s => s.trim()).filter(Boolean)
    //     : []);

  const itineraryText =
  typeof dto.itinerary === 'string' ? dto.itinerary : '';

  const itineraryLines = itineraryText
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const tripName =
    (dto.name && dto.name.trim()) ||
    (itineraryLines.length ? itineraryLines[0] : '') ||
    'Unnamed Adventure';

  // Create the base object (sync fields)
  const frontendTrip: FrontendTrip = {
    id: dto.uuid,
    name: tripName,
    location: 'Loading location...',
    agency: dto.ownerEmail ? `Created by ${dto.ownerEmail}` : 'Community Trip',
    price: dto.budget ?? 0,
    period: this.formatDatePeriod(dto.dateStart, dto.dateEnd),
    imageUrl:
      dto.imageURL ||
      (Array.isArray(dto.imageURLs) && dto.imageURLs.length ? dto.imageURLs[0] : '') ||
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1080&q=80',
  };

    if (dto.location && dto.location.latitude && dto.location.longitude) {
      const latLng = { lat: dto.location.latitude, lng: dto.location.longitude };
      this.geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          frontendTrip.location = this.extractCityAndCountry(results[0]);
        } else {
          frontendTrip.location = 'Unknown Location';
        }
      });
    } else {
      frontendTrip.location = 'Online / TBD';
    }

    return frontendTrip;
  }

  private formatDatePeriod(start: Date | string | null | undefined, end: Date | string | null | undefined): string {
    if (!start || !end) return 'Flexible Dates';
    // Handle both String (ISO) and Date objects safely
    const s = new Date(start);
    const e = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${s.toLocaleDateString('en-US', options)} - ${e.toLocaleDateString('en-US', options)}`;
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
    return city ? `${city}, ${country}` : country || 'Unknown Location';
  }

  get filteredTrips(): FrontendTrip[] {
    return this.allTrips.filter(trip => {

      const search = this.searchTerm.toLowerCase();
      const locFilter = this.locationFilter.toLowerCase();
      const agFilter = this.agencyFilter.toLowerCase();

      const n = trip.name ? trip.name.toLowerCase() : '';
      const l = trip.location ? trip.location.toLowerCase() : '';
      const a = trip.agency ? trip.agency.toLowerCase() : '';

      return (n.includes(search) || l.includes(search)) &&
             (!locFilter || l.includes(locFilter)) &&
             (!agFilter || a.includes(agFilter));
    });
  }

  checkLoginStatus(): void {
    this.userEmail = localStorage.getItem('email');
    this.userName = localStorage.getItem('username');
    this.isLoggedIn = !!localStorage.getItem('idToken');
  }

  joinTrip(tripUuid: string) {
    const email = localStorage.getItem('email');
    if(email) {
      this.tripService.addParticipantToTrip(tripUuid, email).subscribe((res) => {
        console.log(res);
      });
    }
  }

  onNavigate(path: string): void {
    this.router.navigate([`/${path}`]);
  }

  onNavigateToTripDetails(uuid: string) {
  this.router.navigate(['trip', uuid]);
}

  logout(): void {
    localStorage.clear();
    this.checkLoginStatus();
    this.router.navigate(['/login']);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.locationFilter = '';
    this.agencyFilter = '';
  }

  userEmail: string | null = null;
}
