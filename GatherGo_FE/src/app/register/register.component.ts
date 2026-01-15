import { Component } from '@angular/core';
import { AuthService, RegisterPayload } from '../services/auth.service';
import { Router } from '@angular/router';
// import { NgFor, NgIf } from '@angular/common';
// import { NgModel } from '@angular/forms';
// import { NgClass } from '@angular/common';
// import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  // standalone: true,
  // imports: [
  //     NgFor,
  //     NgIf,
  //     FormsModule,
  //     NgClass,
  //   ],
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  form: RegisterPayload = {
    role: 'USER',
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
  };

  loading = false;
  message = '';
  confirmPassword='';

  constructor(private auth: AuthService,
    private router: Router
  ) {}

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

   goToHome() {
    this.router.navigate(['/']);
  }

  selectRole(role: RegisterPayload["role"]) {
    this.form.role = role;
  }

  googleRegister() {
  // TEMP: UI only
  console.log('Google register clicked');

  // Later:
  // - trigger Firebase Google popup
  // - send token to backend
  }
}

