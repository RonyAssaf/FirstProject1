import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Header } from '../../core/header/header';
import { PrimaryButton } from '../../shared/primary-button/primary-button';

import { IntlTelInputComponent } from 'intl-tel-input/angularWithUtils';
import 'intl-tel-input/styles';

@Component({
  selector: 'app-mobile-number',
  standalone: true,
  imports: [
    CommonModule,
    Header,
    PrimaryButton,
    ReactiveFormsModule,
    IntlTelInputComponent,
  ],
  templateUrl: './mobile-number.html',
  styleUrls: ['./mobile-number.scss'],
})
export class MobileNumber {
  /* ------------------------------- FORM SETUP ------------------------------- */

  form = new FormGroup({
    phone: new FormControl<string | null>(null),
    valid: new FormControl<boolean>(false),
  });

  constructor(private router: Router) {}

  /* ------------------------------ INPUT EVENTS ------------------------------ */

  handleNumberChange(event: any) {
    // event contains: { number, nationalNumber, internationalNumber, countryCode }
    const { number } = event;
    this.form.patchValue({ phone: number });
  }

  handleValidityChange(isValid: boolean) {
    this.form.patchValue({ valid: isValid });

    const phoneControl = this.form.controls['phone'];

    if (!isValid) {
      phoneControl.setErrors({ invalidPhone: true });
      return;
    }

  }

  /* --------------------------------- SUBMIT -------------------------------- */

  submit() {
    if (!this.form.valid) return;

    const phone = this.form.value.phone;
    console.log('Submitted phone:', phone);

    this.router.navigate(['transactions']);
  }
}
