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
  private selectedPhone: string | null = null;
  form = new FormGroup({
    currency: new FormControl<string>(''),
    amount: new FormControl<number | null>(null),

    recipientType: new FormControl<'individual' | 'business'>('individual'),

    phone: new FormControl<string | null>(null),
    phoneValid: new FormControl<boolean>(false),
    beneficiaryName: new FormControl<string | null>(null),

    email: new FormControl<string | null>(null),
    companyName: new FormControl<string | null>(null),

    reason: new FormControl<string | null>(null),
  });

  constructor(private router: Router) {
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

  handleNumberChange(event: any) {
    const phoneNumber =
      (typeof event === 'string' ? event : null) ??
      event?.number ??
      event?.phoneNumber ??
      event?.internationalNumber ??
      event?.e164Number ??
      event?.detail?.number ??
      null;

    this.selectedPhone = phoneNumber;

    if (this.form.controls.phoneValid.value) {
      this.form.controls.phone.setValue(phoneNumber);
    }

    console.log('PHONE PARSED:', this.selectedPhone, 'RAW EVENT:', event);
  }

  handleValidityChange(isValid: boolean) {
    this.form.controls.phoneValid.setValue(isValid);
    this.form.updateValueAndValidity();
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

  // =========================
  // GO TO SUMMARY (NO SAVE)
  // =========================
  goToSummary() {
    const v = this.form.getRawValue();
    console.log('FORM RAW VALUE:', this.form.getRawValue());
    const transferDraft = {
      currency: v.currency!,
      amount: v.amount!,

      recipientType: v.recipientType === 'individual' ? 'INDIVIDUAL' : 'BUSINESS',

      // 🔥 USE THE STORED PHONE, NOT THE FORM
      recipientPhone: v.recipientType === 'individual' ? this.selectedPhone : null,

      recipientEmail: v.recipientType === 'business' ? v.email : null,

      beneficiaryName: v.beneficiaryName ?? null,
      companyName: v.companyName ?? null,
      transferReason: v.reason ?? null,
    };

    console.log('TRANSFER DRAFT SENT TO SUMMARY:', transferDraft);

    this.router.navigate(['/transfers/wallet-transfer/summary'], {
      state: { transfer: transferDraft },
    });
  }
}
