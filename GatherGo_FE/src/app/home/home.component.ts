import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Trip {
  id: string;
  name: string;
  location: string;
  agency: string;
  price: number;
  period: string;
  imageUrl: string;
}

// Static Data Array 
const publicTrips: Trip[] = [
  {
    id: '1',
    name: 'Tropical Paradise Getaway',
    location: 'Maldives',
    agency: 'Paradise Travel Co.',
    price: 2499,
    period: 'Dec 15-22, 2025',
    imageUrl: 'https://images.unsplash.com/photo-1660315250109-075f6b142ebc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzY0ODkwMTg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '2',
    name: 'Alpine Adventure Trek',
    location: 'Swiss Alps',
    agency: 'Mountain Explorers',
    price: 3200,
    period: 'Jan 10-20, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1713959989861-2425c95e9777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMHRyYXZlbHxlbnwxfHx8fDE3NjQ4Njc1Nzd8MA&lib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '3',
    name: 'City Lights Tour',
    location: 'New York City',
    agency: 'Urban Adventures',
    price: 1800,
    period: 'Feb 5-12, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1493134799591-2c9eed26201a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjaXR5JTIwc2t5bGluZXxlbnwxfHx8fDE3NjQ5MTgxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '4',
    name: 'Desert Safari Experience',
    location: 'Dubai',
    agency: 'Desert Dreams Travel',
    price: 2100,
    period: 'Mar 1-8, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1598696737715-1e7741c387ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxkZXNlcnQlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzY0OTQ5MDI2fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '5',
    name: 'European Heritage Tour',
    location: 'Rome, Italy',
    agency: 'Europa Wanderlust',
    price: 2800,
    period: 'Apr 15-25, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1716481731194-67a27f868c23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxldXJvcGVhbiUyMGNpdHklMjB0cmF2ZWx8ZW58MXx8fHwxNzY0OTA2MzM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '6',
    name: 'Group Adventure Package',
    location: 'Bali, Indonesia',
    agency: 'Paradise Travel Co.',
    price: 1950,
    period: 'May 10-18, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1764547167909-288254064bd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBncm91cCUyMGZyaWVuZHN8ZW58MXx8fHwxNzY0OTQ5MDI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

   isLoggedIn = false;
  userEmail: string | null = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.checkLoginStatus();
  }

   // Checks if the user has an ID token in localStorage
  checkLoginStatus(): void {
    this.userEmail = localStorage.getItem('email');
    this.isLoggedIn = !!localStorage.getItem('idToken');
  }

  // Simple logout function: clears local storage and navigates to login
  logout(): void {
    localStorage.removeItem('idToken');
    localStorage.removeItem('uid');
    localStorage.removeItem('email');
    localStorage.removeItem('role'); // Clear role if stored

    this.checkLoginStatus(); // Update state
    this.router.navigate(['/login']);
  }

  // State variables 
  searchTerm: string = '';
  locationFilter: string = '';
  agencyFilter: string = '';

  allTrips: Trip[] = publicTrips;
  

  // Angular equivalent of the React component's filter logic (using a getter)
  get filteredTrips(): Trip[] {
    return this.allTrips.filter(trip => {
      const lowerSearch = this.searchTerm.toLowerCase();
      const lowerLocationFilter = this.locationFilter.toLowerCase();
      const lowerAgencyFilter = this.agencyFilter.toLowerCase();

      // 1. Matches Search Term (Name OR Location)
      const matchesSearch = trip.name.toLowerCase().includes(lowerSearch) ||
                            trip.location.toLowerCase().includes(lowerSearch);
                            
      // 2. Matches Location Filter
      const matchesLocation = !lowerLocationFilter || trip.location.toLowerCase().includes(lowerLocationFilter);
      
      // 3. Matches Agency Filter
      const matchesAgency = !lowerAgencyFilter || trip.agency.toLowerCase().includes(lowerAgencyFilter);
      
      return matchesSearch && matchesLocation && matchesAgency;
    });
  }

  // Programmatic navigation (equivalent to onNavigate)
  onNavigate(path: string): void {
    if (path === 'login' || path === 'register') {
      this.router.navigate([`/${path}`]);
    } else {
      console.warn(`Attempted navigation to unknown path: ${path}`);
    }
  }

  // Event handler to clear all filters
  clearFilters(): void {
    this.searchTerm = '';
    this.locationFilter = '';
    this.agencyFilter = '';
  }
}