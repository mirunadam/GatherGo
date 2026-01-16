import {Routes} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import { ProfileComponent } from "./profile/profile.component";

export const routes: Routes = [
  { path: '', component: HomeComponent }, //redirectTo: '/login', pathMatch: 'full'
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  {
    path: 'trip',
    loadComponent: () => import('./trips/feature-trip-list/feature-trip-list.component').then(m => m.FeatureTripListComponent),
  },
  {
    path: 'trip/form',
    loadComponent: () => import('./trips/feature-create-trip/trip-form/trip-form.component').then(m => m.TripFormComponent)
  },
  { path: 'trip/details',
    loadComponent: ()=> import('./trip-details/trip-details.component').then(m=> m.TripDetailsComponent)
  }
  
];
