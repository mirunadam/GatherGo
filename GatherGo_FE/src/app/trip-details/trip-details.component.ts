import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';

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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './trip-details.component.html',
})
export class TripDetailsComponent {

  @Input() trip!: any;
  @Input() user!: any;

  activeTab: 'overview' | 'activities' | 'accommodations' | 'photos' | 'participants' = 'overview';

  activities: Activity[] = [];
  accommodations: Accommodation[] = [];
  photos: any[] = [];
  likedPhotos = new Set<string>();

  showActivityForm = false;
  showAccommodationForm = false;

  newActivity: Activity = {
    id: '',
    name: '',
    description: '',
    date: '',
    time: '',
  };

  newAccommodation: Accommodation = {
    id: '',
    name: '',
    address: '',
    checkIn: '',
    checkOut: '',
    price: 0,
  };

  mockParticipants = [
    { id: '1', name: 'Demo User', email: 'demo@example.com' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: '3', name: 'Mike Chen', email: 'mike@example.com' },
  ];

  constructor(private router: Router, private location: Location) {}

  ngOnInit() {
    this.activities = this.trip?.activities || [];
    this.accommodations = this.trip?.accommodations || [];
    this.photos = this.trip?.photos || [];

    this.photos.forEach((p: any) => {
      if (p.likes?.includes(this.user.id)) {
        this.likedPhotos.add(p.id);
      }
    });
  }

  goBack() {
    this.location.back();
  }

  addActivity() {
    this.activities.push({
      ...this.newActivity,
      id: Date.now().toString(),
    });
    this.newActivity = { id: '', name: '', description: '', date: '', time: '' };
    this.showActivityForm = false;
  }

  addAccommodation() {
    this.accommodations.push({
      ...this.newAccommodation,
      id: Date.now().toString(),
    });
    this.newAccommodation = { id: '', name: '', address: '', checkIn: '', checkOut: '', price: 0 };
    this.showAccommodationForm = false;
  }

  toggleLike(photoId: string) {
    this.likedPhotos.has(photoId)
      ? this.likedPhotos.delete(photoId)
      : this.likedPhotos.add(photoId);
  }

  tabs: ('overview' | 'activities' | 'accommodations' | 'photos' | 'participants')[] = [
  'overview',
  'activities',
  'accommodations',
  'photos',
  'participants'
];

}
