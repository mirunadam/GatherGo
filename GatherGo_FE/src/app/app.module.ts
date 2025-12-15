import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FormsModule } from '@angular/forms';
// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

import { AngularFireModule } from '@angular/fire/compat'; 
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { HomeComponent } from './home/home.component';
import { TripFormComponent } from './trips/feature-create-trip/trip-form/trip-form.component';
import {GoogleMapsModule} from "@angular/google-maps";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase), // Initialize Firebase app
    AngularFireAuthModule
    AppRoutingModule,
    TripFormComponent,
    GoogleMapsModule,
    BrowserAnimationsModule
  ],
  providers: [], //ask daca mai trebe pus ceva aici
  bootstrap: [AppComponent]
})
export class AppModule { }
