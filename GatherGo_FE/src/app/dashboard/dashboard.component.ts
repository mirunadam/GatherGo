import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TripService } from '../trips/services/trip.service';
import { TripDto } from '../trips/domain/trip.dto';
import { ProfileService } from '../services/profile.service';

type TripStatus = 'upcoming' | 'active' | 'past';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  errorMsg: string | null = null;

  isLoggedIn = false;
  userEmail: string | null = null;
  userName: string | null = null;

  allTrips: TripDto[] = [];
  myTrips: TripDto[] = [];

  constructor(
    private router: Router,
    private location: Location,
    private tripService: TripService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();

    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-trips' } });
      return;
    }

    // if email is not stored, load from profile (same pattern as your TripDetails)
    if (!this.userEmail) {
      const uid = localStorage.getItem('uid');
      if (uid) {
        this.profileService.getUser(uid).subscribe({
          next: (data: any) => {
            this.userName = data.username || data.fullname || null;
            this.userEmail = data.email || null;
            if (this.userEmail) localStorage.setItem('email', this.userEmail);
            this.loadTrips();
          },
          error: (err) => {
            console.error(err);
            this.errorMsg = 'Failed to load user profile.';
            this.isLoading = false;
          }
        });
        return;
      }
    }

    this.loadTrips();
  }

  checkLoginStatus(): void {
    this.userEmail = localStorage.getItem('email');
    this.userName = localStorage.getItem('username');
    this.isLoggedIn = !!localStorage.getItem('idToken');
  }

  loadTrips(): void {
    this.isLoading = true;
    this.errorMsg = null;

    this.tripService.getAllSpecificTrips(this.userEmail!).subscribe({
      next: (dtos:any) => {
        this.allTrips = dtos ?? [];
        const email = this.userEmail ?? '';
        this.myTrips = this.allTrips.filter(t => (t.ownerEmail ?? '') === email);

        this.isLoading = false;
      },
      error: (err:any) => {
        console.error('Failed to load trips', err);
        this.errorMsg = 'Failed to load trips.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  onCreateTrip(): void {
    this.router.navigate(['/trip/form']);
  }

  onViewTrip(trip: TripDto): void {
    this.router.navigate(['trip', trip.uuid]);
  }

  getStatus(trip: TripDto): TripStatus {
    const now = new Date().getTime();
    const start = trip.dateStart ? new Date(trip.dateStart as any).getTime() : null;
    const end = trip.dateEnd ? new Date(trip.dateEnd as any).getTime() : null;

    if (start != null && now < start) return 'upcoming';
    if (start != null && end != null && now >= start && now <= end) return 'active';
    if (end != null && now > end) return 'past';
    return 'upcoming';
  }

  getStatusBadgeClass(status: TripStatus): string {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'past': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  totalPhotos(trips: TripDto[]): number {
    return trips.reduce((sum, t: any) => sum + ((t.imageURLs?.length ?? 0) + (t.imageURL ? 1 : 0)), 0);
  }

  upcomingCount(trips: TripDto[]): number {
    return trips.filter(t => this.getStatus(t) === 'upcoming').length;
  }
}
