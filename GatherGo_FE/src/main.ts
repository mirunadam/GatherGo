import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// import { bootstrapApplication } from '@angular/platform-browser';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient } from '@angular/common/http';
// import { importProvidersFrom } from '@angular/core';

// import { AppComponent } from './app/app.component';
// import { routes } from './app/routes';

// import { provideAnimations } from '@angular/platform-browser/animations';
// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideAuth, getAuth } from '@angular/fire/auth';
// import { environment } from './environments/environment';

// bootstrapApplication(AppComponent, {
//   providers: [
//     provideRouter(routes),
//     provideHttpClient(),
//     provideAnimations(),

//     importProvidersFrom(
//       provideFirebaseApp(() => initializeApp(environment.firebase)),
//       provideAuth(() => getAuth())
//     ),
//   ],
// }).catch(err => console.error(err));
