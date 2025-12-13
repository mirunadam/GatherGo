import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/trip/form'
  },
  {
    path: 'trip',
    children: [
      {
        path: 'form',
        loadComponent: () => import('./trips/feature-create-trip/trip-form/trip-form.component').then(m => m.TripFormComponent)
      }
    ]
  }
];
