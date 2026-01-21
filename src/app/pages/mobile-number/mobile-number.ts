import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Header } from '../../core/header/header';
import { PrimaryButton } from '../../shared/primary-button/primary-button';
import { IntlTelInputComponent } from 'intl-tel-input/angularWithUtils';
import 'intl-tel-input/styles';

import { CurrentUserService } from 'src/app/core/servics/current-user.service';
import { UserService } from 'src/app/core/servics/user.services';
import { AuthService } from 'src/app/core/guards/AuthService';

@Component({
  selector: 'app-mobile-number',
  standalone: true,
  imports: [CommonModule, Header, PrimaryButton, ReactiveFormsModule, IntlTelInputComponent],
  templateUrl: './mobile-number.html',
  styleUrls: ['./mobile-number.scss'],
})
export class MobileNumber {
  /** phone is handled by intl-tel-input */
  private phoneNumber: string | null = null;

  form = new FormGroup({
    valid: new FormControl<boolean>(false),
  });

  constructor(
    private router: Router,
    private currentUser: CurrentUserService,
    private userService: UserService,
    private authService: AuthService,
  ) {}

  /** emitted by intl-tel-input */
  handleNumberChange(event: unknown): void {
    const e = event as any;

    // event might be a string OR an object depending on the wrapper
    const value =
      (typeof e === 'string' ? e : null) ??
      e?.number ??
      e?.phoneNumber ??
      e?.internationalNumber ??
      e?.e164Number ??
      e?.detail?.number ??
      null;

    this.phoneNumber = value;
  }

  handleValidityChange(isValid: boolean): void {
    this.form.patchValue({ valid: isValid });
  }

  submit(): void {
    const user = this.currentUser.getUser();

    if (!user?.email || !user?.password || !this.phoneNumber) {
      console.error('Missing registration data');
      return;
    }

    const email = user.email; // ✅ now strictly string
    const password = user.password; // ✅ now strictly string

    const registerPayload = {
      email,
      password,
      phoneNumber: this.phoneNumber,
    };

    this.userService.register(registerPayload).subscribe({
      next: (createdUser) => {
        this.currentUser.setUser({
          id: createdUser.id,
          email: createdUser.email,
          phoneNumber: createdUser.phoneNumber,
        });

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
