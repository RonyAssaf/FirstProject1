import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CurrentUserService } from 'src/app/core/servics/current-user.service';
import { UserService, AuthUser } from 'src/app/core/servics/user.services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);

  form: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private currentUser: CurrentUserService,
    private userService: UserService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required, Validators.minLength(8)]),
    });
  }

  // =========================
  // SUBMIT LOGIN
  // =========================
  onSubmit(): void {
    this.errorMsg.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      email: this.form.value.email!,
      password: this.form.value.password!,
    };

    this.isLoading.set(true);

    this.userService.login(payload).subscribe({
      next: (user: AuthUser) => {
        // ✅ SAVE FOR AUTH GUARD
        localStorage.setItem(
          'auth_user',
          JSON.stringify({
            id: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
          })
        );

        // ✅ KEEP CURRENT USER AVAILABLE IN APP
        this.currentUser.setUser({
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
        });

        this.router.navigate(['/transactions']);
      },
      error: (err: unknown) => {
        this.errorMsg.set('Invalid email or password');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  // =========================
  // GETTERS USED BY TEMPLATE
  // =========================
  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }
}
