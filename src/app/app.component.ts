import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private authService: AuthService) {}

  async login() {
    await this.authService.login('user@example.com', 'password');
    const token = await this.authService.getIdToken();
    console.log('Firebase ID Token:', token);
  }

  async register() {
    await this.authService.register('newuser@example.com', 'password');
  }

  async logout() {
    await this.authService.logout();
  }
}

