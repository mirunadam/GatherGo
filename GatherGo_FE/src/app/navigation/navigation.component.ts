import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../shared-domain/user-role.model';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  // Icons as string names
//   readonly MapPin = MapPin;
//   readonly LayoutDashboard = LayoutDashboard;
//   readonly Mail = Mail;
//   readonly User = User;
//   readonly LogOut = LogOut;
//   readonly Shield = Shield;

  protected readonly UserRole = UserRole;

  isLoggedIn = false;
  userName: string | null = null;
  userEmail: string | null = null;

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  get userRole(): UserRole {
    return this.authService.userRole();
    // const role = localStorage.getItem('role') as UserRole;
    // return role ? role : UserRole.USER;
  }

  get navItems() {
    if (this.userRole === UserRole.AGENCY) {
      return [
        { label: 'Dashboard', icon: 'dashboard', link: '/agency-dashboard' },
        { label: 'Create Trip', icon: 'add_location_alt', link: '/create-trip' },
        { label: 'Profile', icon: 'person', link: '/profile' }
      ];
    }

    // Default USER
    return [
      { label: 'Dashboard', icon: 'dashboard', link: '/dashboard' },
      { label: 'Create Trip', icon: 'add_location_alt', link: '/create-trip' },
      { label: 'Invitations', icon: 'mail', link: '/invitations' },
      { label: 'Profile', icon: 'person', link: '/profile' }
    ];
  }

  getHomeLink() {
    if (this.userRole === UserRole.AGENCY) return '/agency-dashboard';
    return '/dashboard';
  }

  checkLoginStatus(): void {
    this.userEmail = localStorage.getItem('email');
    this.userName = localStorage.getItem('username');
    this.isLoggedIn = !!localStorage.getItem('idToken');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
