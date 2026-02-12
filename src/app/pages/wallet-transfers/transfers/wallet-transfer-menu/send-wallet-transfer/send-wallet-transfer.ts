import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Router } from '@angular/router';

import { catchError, debounceTime, distinctUntilChanged, of } from 'rxjs';
import { UserService } from 'src/app/core/servics/user.services';

// ✅ replace intl-tel-input with your reusable component
import { PhoneInputComponent } from 'src/app/shared/phone-input/phone-input.component';

@Component({
  selector: 'app-send-wallet-transfer',
  standalone: true,
  imports: [ReactiveFormsModule, RadioButtonModule, PhoneInputComponent],
  templateUrl: './send-wallet-transfer.html',
  styleUrl: './send-wallet-transfer.scss',
})
export class SendWalletTransfer {
  private selectedPhone: string | null = null;

  // ✅ errors shown under labels
  phoneLookupError: string | null = null;
  emailLookupError: string | null = null;

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

  constructor(
    private router: Router,
    private userService: UserService,
  ) {
    // toggle reset (UNCHANGED)
    this.form.controls.recipientType.valueChanges.subscribe((type) => {
      this.phoneLookupError = null;
      this.emailLookupError = null;

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

    // ✅ Business email lookup (UNCHANGED)
    this.form.controls.email.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((email) => {
        if (this.form.controls.recipientType.value !== 'business') return;

        this.emailLookupError = null;

        if (!email || !email.includes('@')) {
          this.form.controls.companyName.setValue(null);
          return;
        }

        this.userService
          .lookupByEmail(email)
          .pipe(catchError(() => of(null)))
          .subscribe((res) => {
            if (!res) {
              this.emailLookupError = 'Non existing Email';
              this.form.controls.companyName.setValue(null);
              return;
            }

            this.emailLookupError = null;
            this.form.controls.companyName.setValue(res.displayName);
          });
      });
  }

  /**
   * ✅ Same function name as before, but now receives E.164 directly
   * from <app-phone-input> (valueChange).
   *
   * Example: "+96170377444"
   */
  handleNumberChange(phoneNumber: string | null) {
    this.selectedPhone = phoneNumber;

    // ✅ keep same behavior: only lookup when phone is valid
    if (this.form.controls.phoneValid.value && phoneNumber) {
      this.form.controls.phone.setValue(phoneNumber);
      this.lookupPhoneAndFillName(phoneNumber);
    } else {
      this.phoneLookupError = null;
      this.form.controls.beneficiaryName.setValue(null);
    }
  }

  /**
   * ✅ Same function name as before, now receives boolean from (validChange)
   */
  handleValidityChange(isValid: boolean) {
    this.form.controls.phoneValid.setValue(isValid);
    this.form.updateValueAndValidity();

    if (!isValid) {
      this.phoneLookupError = null;
      this.form.controls.beneficiaryName.setValue(null);
      return;
    }

    // if it becomes valid, lookup immediately (same logic)
    if (isValid && this.selectedPhone) {
      this.lookupPhoneAndFillName(this.selectedPhone);
    }
  }

  private lookupPhoneAndFillName(phone: string | null) {
    if (this.form.controls.recipientType.value !== 'individual') return;

    this.phoneLookupError = null;

    if (!phone) {
      this.form.controls.beneficiaryName.setValue(null);
      return;
    }

    this.userService
      .lookupByPhone(phone)
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        if (!res) {
          this.phoneLookupError = 'Non existing phoneNumber';
          this.form.controls.beneficiaryName.setValue(null);
          return;
        }

        this.phoneLookupError = null;
        this.form.controls.beneficiaryName.setValue(res.displayName);
      });
  }

  /** FINAL VALIDATION (UNCHANGED) */
  get canContinue(): boolean {
    const v = this.form.value;

    if (!v.currency || !v.amount || v.amount <= 0 || !v.reason) return false;

    if (v.recipientType === 'individual') {
      return Boolean(v.phoneValid && v.beneficiaryName && !this.phoneLookupError);
    }

    if (v.recipientType === 'business') {
      return Boolean(v.email && v.companyName && !this.emailLookupError);
    }

    return false;
  }

  goToSummary() {
    const v = this.form.getRawValue();

    const transferDraft = {
      currency: v.currency!,
      amount: v.amount!,

      recipientType: v.recipientType === 'individual' ? 'INDIVIDUAL' : 'BUSINESS',

      recipientPhone: v.recipientType === 'individual' ? this.selectedPhone : null,
      recipientEmail: v.recipientType === 'business' ? v.email : null,

      beneficiaryName: v.beneficiaryName ?? null,
      companyName: v.companyName ?? null,
      transferReason: v.reason ?? null,
    };

    this.router.navigate(['/transfers/wallet-transfer/summary'], {
      state: { transfer: transferDraft },
    });
  }
}
