import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../core/header/header';
import { PrimaryButton } from '../../shared/primary-button/primary-button';

@Component({
  selector: 'app-create-password',
  standalone: true,
  imports: [ReactiveFormsModule, Header, PrimaryButton],
  templateUrl: './create-password.html',
  styleUrls: ['./create-password.scss'],
})
export class CreatePasswordComponent {
  form!: FormGroup<{
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      password: this.fb.control<string | null>('', {
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/(?=.*[A-Z])/),
          Validators.pattern(/(?=.*[a-z])/),
          Validators.pattern(/(?=.*\d)/),
          Validators.pattern(/(?=.[@$!%?&])/),
        ],
      }),
      confirmPassword: this.fb.control<string | null>(''),
    });
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  passwordsMatch(): boolean {
    return this.password.value === this.confirmPassword.value;
  }

  allValid(): boolean {
    return this.form.valid && this.passwordsMatch();
  }

  onSubmit() {
    if (!this.allValid()) return;
    this.router.navigate(['/next-page']);
  }
}
