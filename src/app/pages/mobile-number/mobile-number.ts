import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
    FormsModule,
    IntlTelInputComponent,
  ],
  templateUrl: './mobile-number.html',
  styleUrls: ['./mobile-number.scss'],
})
export class MobileNumber {
  form = new FormGroup({
    phone: new FormControl(''),
    valid: new FormControl(false),
  });

  constructor(private router: Router) {}

  handleNumberChange(event: any) {
    const { number } = event;
    this.form.patchValue({ phone: number });
    this.form.controls['phone'].updateValueAndValidity();
  }

  handleValidityChange(isValid: boolean) {
    this.form.get('valid')?.setValue(isValid);

    if (!isValid) {
      this.form.controls['phone'].setErrors({ invalidPhone: true });
    } else {
      const errors = this.form.controls['phone'].errors;
      if (errors) {
        delete errors['invalidPhone'];
        if (Object.keys(errors).length === 0) {
          this.form.controls['phone'].setErrors(null);
        }
      }
    }
  }

  submit() {
    if (this.form.valid) {
      console.log('Submitted phone:', this.form.value.phone);
      this.router.navigate(['transactions']);
    }
  }
}
