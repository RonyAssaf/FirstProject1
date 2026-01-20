import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import 'primeicons/primeicons.css';
import { Header } from '../../shared/header/header';
import { CurrentUserService } from 'src/app/core/servics/current-user.service';

@Component({
  selector: 'app-create-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, Header],
  templateUrl: './create-password.html',
  styleUrls: ['./create-password.scss'],
})
export class CreatePasswordComponent {
  form!: FormGroup<{
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private currentUser: CurrentUserService
  ) {
    this.form = this.fb.group({
      password: this.fb.control<string | null>(''),
      confirmPassword: this.fb.control<string | null>(''),
    });
  }

  isChecked = signal(false);

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  hasMinLength() {
    return (this.password.value?.length ?? 0) >= 8;
  }

  hasUppercase() {
    return /[A-Z]/.test(this.password.value ?? '');
  }

  hasLowercase() {
    return /[a-z]/.test(this.password.value ?? '');
  }

  hasNumber() {
    return /\d/.test(this.password.value ?? '');
  }

  hasSpecial() {
    return /[@$!%*?&]/.test(this.password.value ?? '');
  }

  passwordsMatch() {
    return this.password.value === this.confirmPassword.value;
  }

  allValid() {
    return (
      this.hasMinLength() &&
      this.hasUppercase() &&
      this.hasLowercase() &&
      this.hasNumber() &&
      this.hasSpecial() &&
      this.passwordsMatch() &&
      this.isChecked()
    );
  }

  // ✅ STORE PASSWORD TEMPORARILY (NOT IN DB)
  onSubmit() {
    if (!this.allValid()) return;

    const tempUser = this.currentUser.getUser();

    if (!tempUser?.email) {
      console.error('No email found');
      return;
    }

    // ✅ THIS LINE IS REQUIRED
    this.currentUser.setUser({
      password: this.password.value!,
    });

    this.router.navigate(['mobile-number']);
  }
}
