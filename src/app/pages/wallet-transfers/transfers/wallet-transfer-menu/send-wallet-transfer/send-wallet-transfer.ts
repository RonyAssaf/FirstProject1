import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Router } from '@angular/router';

import { IntlTelInputComponent } from 'intl-tel-input/angularWithUtils';
import 'intl-tel-input/styles';

@Component({
  selector: 'app-send-wallet-transfer',
  standalone: true,
  imports: [ReactiveFormsModule, RadioButtonModule, IntlTelInputComponent],
  templateUrl: './send-wallet-transfer.html',
  styleUrl: './send-wallet-transfer.scss',
})
export class SendWalletTransfer {
  form = new FormGroup({
    currency: new FormControl<string>(''),
    amount: new FormControl<number | null>(null),

    recipientType: new FormControl<'individual' | 'business'>('individual'),

    // Individual
    phone: new FormControl<string | null>(null),
    phoneValid: new FormControl<boolean>(false),
    beneficiaryName: new FormControl<string | null>(null),

    // Business
    email: new FormControl<string | null>(null),
    companyName: new FormControl<string | null>(null),

    reason: new FormControl<string | null>(null),
  });
  ingredient: any;

  constructor(private router: Router) {
    // Clear irrelevant fields when switching recipient type
    this.form.controls.recipientType.valueChanges.subscribe((type) => {
      if (type === 'individual') {
        this.form.patchValue({
          email: null,
          companyName: null,
        });
      } else {
        this.form.patchValue({
          phone: null,
          phoneValid: false,
          beneficiaryName: null,
        });
      }
      this.form.updateValueAndValidity();
    });
  }

  /** intl-tel-input handlers */
  handleNumberChange(event: any) {
    this.form.controls.phone.setValue(event?.number ?? null);
    this.form.updateValueAndValidity();
  }

  handleValidityChange(isValid: boolean) {
    this.form.controls.phoneValid.setValue(isValid);
    this.form.updateValueAndValidity(); // 🔑 REQUIRED
  }

  /** FINAL VALIDATION */
  get canContinue(): boolean {
    const v = this.form.value;

    if (!v.currency || !v.amount || v.amount <= 0 || !v.reason) {
      return false;
    }

    if (v.recipientType === 'individual') {
      return Boolean(v.phoneValid && v.beneficiaryName);
    }

    if (v.recipientType === 'business') {
      return Boolean(v.email && v.companyName);
    }

    return false;
  }
  goToSummary() {
    this.router.navigate(['/transfers/wallet-transfer/summary'], {
      state: { data: this.form.value },
    });
  }
}
