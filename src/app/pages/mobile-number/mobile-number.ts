/* eslint-disable @angular-eslint/prefer-inject */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Header } from '../../core/header/header';
import { PrimaryButton } from '../../shared/primary-button/primary-button';

import { CurrentUserService } from 'src/app/core/servics/current-user.service';
import { UserService } from 'src/app/core/servics/user.services';
import { AuthService } from 'src/app/core/guards/AuthService';

// ✅ Reusable component you’ll use in multiple pages
import { PhoneInputComponent } from 'src/app/shared/phone-input/phone-input.component';

@Component({
  selector: 'app-mobile-number',
  standalone: true,
  imports: [CommonModule, Header, PrimaryButton, ReactiveFormsModule, PhoneInputComponent],
  templateUrl: './mobile-number.html',
  styleUrls: ['./mobile-number.scss'],
})
export class MobileNumber {
  /**
   * The final phone number in E.164 format coming from <app-phone-input>
   * Example: "+96170377444"
   */
  phoneE164: string | null = null;

  /**
   * Keep your existing boolean validity logic (used to disable button)
   */
  form = new FormGroup({
    valid: new FormControl<boolean>(false, { nonNullable: true }),
  });

  constructor(
    private router: Router,
    private currentUser: CurrentUserService,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  /**
   * Receives E.164 from the phone component
   */
  onPhoneValueChange(value: string | null): void {
    this.phoneE164 = value;
  }

  /**
   * Receives validity from the phone component
   * (mobile-only + possible + valid-for-region)
   */
  onPhoneValidChange(isValid: boolean): void {
    this.form.patchValue({ valid: isValid }, { emitEvent: false });
  }

  /**
   * Your existing flow: register -> auto-login -> store token -> navigate
   */
  submit(): void {
    const user = this.currentUser.getUser();

    // Must have email/password from previous step + valid phone
    if (!user?.email || !user?.password || !this.phoneE164) {
      console.error('Missing registration data');
      return;
    }

    const email = user.email;
    const password = user.password;

    const registerPayload = {
      email,
      password,
      phoneNumber: this.phoneE164, // ✅ already E.164
    };

    this.userService.register(registerPayload).subscribe({
      next: (createdUser) => {
        // store created user
        this.currentUser.setUser({
          id: createdUser.id,
          email: createdUser.email,
          phoneNumber: createdUser.phoneNumber,
        });

        // auto login
        this.userService.login({ email, password }).subscribe({
          next: (res) => {
            this.authService.setToken(res.token);

            this.currentUser.setUser({
              id: res.user.id,
              email: res.user.email,
              phoneNumber: res.user.phoneNumber,
            });

            this.router.navigate(['/transactions']);
          },
          error: (err) => {
            console.error('Auto-login failed after register', err);
            this.router.navigate(['/login']);
          },
        });
      },
      error: (err) => {
        console.error('Registration failed', err);
      },
    });
  }
}
