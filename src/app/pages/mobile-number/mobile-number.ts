import { Component } from '@angular/core';
import { Header } from '../../core/header/header';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { PrimaryButton } from '../../shared/primary-button/primary-button';
import { NgxIntlTelInputModule, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { SearchCountryField } from 'ngx-intl-tel-input';
import { IntlTelInputComponent } from 'intl-tel-input/angularWithUtils';
import 'intl-tel-input/styles';

@Component({
  selector: 'app-mobile-number',
  standalone: true,
  imports: [
    Header,
    PrimaryButton,
    NgxIntlTelInputModule,
    ReactiveFormsModule,
    FormsModule,
    IntlTelInputComponent,
  ],
  templateUrl: './mobile-number.html',
  styleUrl: './mobile-number.scss',
})
export class MobileNumber {
  handleValidityChange($event: boolean) {
    throw new Error('Method not implemented.');
  }
  handleNumberChange($event: string) {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;

  form = new FormGroup({
    phone: new FormControl(null, Validators.required),
  });

  constructor(private router: Router) {}

  submit() {
    if (this.form.valid) {
      console.log(this.form.value.phone);
      this.router.navigate(['verify-email']);
    }
  }
}
