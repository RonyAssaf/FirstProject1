import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { PrimaryButton } from '../../shared/primary-button/primary-button';
import { Header } from '../../core/header/header';
import { Disclaimer } from '../../shared/disclaimer/disclaimer';
import { EmailInput } from '../../shared/email-input/email-input';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CurrentUserService } from 'src/app/core/servics/current-user.service';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [
    Header,
    EmailInput,
    PrimaryButton,
    Disclaimer,
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './create-account.html',
  styleUrls: ['./create-account.scss'],
})
export class CreateAccountComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, this.validateEmail]),
  });
  constructor(private router: Router, private currentUser: CurrentUserService) {}
  submit() {
    if (this.form.valid) {
      this.currentUser.setUser({
        email: this.form.value.email!,
      });
      this.router.navigate(['verify-email']);
    }
  }
  Login() {
    this.router.navigate(['verify-email']);
  }

  validateEmail(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) ? null : { invalidEmail: true };
  }
}
