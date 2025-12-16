import { Component } from '@angular/core';
import { Router } from '@angular/router';

type Role = 'user' | 'agency';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  role: Role = 'user';

  username = '';
  fullName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  error = '';

  constructor(private router: Router) {}

  selectRole(role: Role) {
    this.role = role;
  }

  submit() {
    this.error = '';

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    console.log('Register:', {
      username: this.username,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      role: this.role,
    });

    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  googleRegister() {
  // TEMP: UI only
  console.log('Google register clicked');

  // Later:
  // - trigger Firebase Google popup
  // - send token to backend
}

}
