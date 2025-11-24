import { Component } from '@angular/core';
import { AuthService, RegisterPayload } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  form: RegisterPayload = {
    role: 'USER',
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: ''
  };

  loading = false;
  message = '';

  constructor(private auth: AuthService) {}

  submit() {
    this.message = '';
    this.loading = true;

    this.auth.register(this.form).subscribe({
      next: (uid) => {
        this.loading = false;
        this.message = `Registered successfully! UID: ${uid}`;
      },
      error: (err) => {
        this.loading = false;
        this.message = err?.error || 'Register failed';
      }
    });
  }
}
