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
import intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-mobile-number',
  standalone: true,
  imports: [Header, PrimaryButton, NgxIntlTelInputModule, ReactiveFormsModule, FormsModule],
  templateUrl: './mobile-number.html',
  styleUrl: './mobile-number.scss',
})
export class MobileNumber {
  const input = document.querySelector("#phone");
const button = document.querySelector("#btn");
const errorMsg = document.querySelector("#error-msg");
const validMsg = document.querySelector("#valid-msg");

// here, the index maps to the error code returned from getValidationError - see readme
const errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];

// initialise plugin
const iti = window.intlTelInput(input, {
  initialCountry: "us",
  loadUtils: () => import("/intl-tel-input/js/utils.js?1762589505757"),
});

const reset = () => {
  input.classList.remove("error");
  errorMsg.innerHTML = "";
  errorMsg.classList.add("hide");
  validMsg.classList.add("hide");
};

const showError = (msg) => {
  input.classList.add("error");
  errorMsg.innerHTML = msg;
  errorMsg.classList.remove("hide");
};

// on click button: validate
button.addEventListener('click', () => {
  reset();
  if (!input.value.trim()) {
    showError("Required");
  } else if (iti.isValidNumber()) {
    validMsg.classList.remove("hide");
  } else {
    const errorCode = iti.getValidationError();
    const msg = errorMap[errorCode] || "Invalid number";
    showError(msg);
  }
});

// on keyup / change flag: reset
input.addEventListener('change', reset);
input.addEventListener('keyup', reset);
}
