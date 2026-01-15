import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'GatherGo Frontend';
}

// // The other version
// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { NavigationComponent } from './navigation/navigation.component';

// @Component({
//   selector: 'app-root',
//   // standalone: true,
//   // imports: [
//   //   RouterOutlet,
//   //   NavigationComponent
//   // ],
//   templateUrl: './app.component.html',
// })
// export class AppComponent {}
