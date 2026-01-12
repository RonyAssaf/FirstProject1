import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Header } from '../../core/header/header';
import { PrimaryButton } from '../../shared/primary-button/primary-button';
import { IntlTelInputComponent } from 'intl-tel-input/angularWithUtils';
import 'intl-tel-input/styles';

import { CurrentUserService } from 'src/app/core/servics/current-user.service';
import { AuthUser, UserService } from 'src/app/core/servics/user.services';

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
    private userService: UserService
  ) {}

  /** emitted by intl-tel-input */
  handleNumberChange(event: any): void {
    // event might be a string OR an object depending on the wrapper
    const value =
      (typeof event === 'string' ? event : null) ??
      event?.number ??
      event?.phoneNumber ??
      event?.internationalNumber ??
      event?.e164Number ??
      event?.detail?.number ??
      null;

    this.phoneNumber = value;
    console.log('PHONE PARSED:', this.phoneNumber, 'RAW EVENT:', event);
  }

  handleValidityChange(isValid: boolean): void {
    this.form.patchValue({ valid: isValid });
  }

  submit(): void {
    const user = this.currentUser.getUser();

    console.log('DEBUG PHONE:', this.phoneNumber);
    console.log('DEBUG CURRENT USER:', user);

    // 🔒 Safety check — registration must be complete
    if (!user?.email || !user?.password || !this.phoneNumber) {
      console.error('Missing registration data');
      return;
    }

    // ✅ Final payload — ONE DB INSERT
    const payload = {
      email: user.email,
      password: user.password,
      phoneNumber: this.phoneNumber,
    };

    this.userService.register(payload).subscribe({
      next: (createdUser: AuthUser) => {
        // ✅ OVERWRITE current user with AUTHENTICATED user
        this.currentUser.setUser({
          id: createdUser.id,
          email: createdUser.email,
          phoneNumber: createdUser.phoneNumber,
        });

        // ✅ Persist for refresh / guards
        localStorage.setItem(
          'current_user',
          JSON.stringify({
            id: createdUser.id,
            email: createdUser.email,
            phoneNumber: createdUser.phoneNumber,
          })
        );

        // 🚀 Go to protected area
        this.router.navigate(['/transactions']);
      },
      error: (err: unknown) => {
        console.error('Registration failed', err);
      },
    });
  }
}
