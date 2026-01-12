import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { TransactionsService } from '../transactions/transactions.service';
import { CurrentUserService } from 'src/app/core/servics/current-user.service';

import { ToastService } from '@components/toast/toast.service';
import { OtpInputComponent } from '@components/otp-input/otp-input';
import { ToastComponent } from '@components/toast/toast';

type RecipientType = 'INDIVIDUAL' | 'BUSINESS';

@Component({
  selector: 'app-passcode',
  standalone: true,
  imports: [OtpInputComponent, ToastComponent],
  templateUrl: './passcode.html',
  styleUrl: './passcode.scss',
})
export class Passcode {
  private readonly CORRECT_CODE = '123456';

  private transfer = history.state?.transfer;

  constructor(
    private router: Router,
    private txService: TransactionsService,
    private currentUser: CurrentUserService,
    private toast: ToastService
  ) {}

  onOtpChange(code: string) {
    if (code.length !== 6) return;

    if (code !== this.CORRECT_CODE) {
      this.toast.show('Incorrect passcode');
      return;
    }

    const user = this.currentUser.getUser();

    if (!user?.id || !this.transfer) {
      this.toast.show('User not authenticated or transfer missing');
      return;
    }

    console.log('TRANSFER OBJECT:', this.transfer);

    // ✅ STRICT TYPE FOR BACKEND
    const recipientType: RecipientType =
      this.transfer.recipientType === 'individual' ? 'INDIVIDUAL' : 'BUSINESS';

    const payload = {
      fromUserId: user.id,
      recipientType,

      recipientPhone: recipientType === 'INDIVIDUAL' ? this.transfer.phone : undefined,

      recipientEmail: recipientType === 'BUSINESS' ? this.transfer.email : undefined,

      beneficiaryName: this.transfer.beneficiaryName ?? undefined,
      companyName: this.transfer.companyName ?? undefined,
      transferReason: this.transfer.reason ?? undefined,

      currency: this.transfer.currency,
      amount: this.transfer.amount,
    };

    console.log('PAYLOAD SENT:', payload);

    this.txService.walletTransfer(payload).subscribe({
      next: () => {
        this.router.navigate(['/successful']);
      },
      error: () => {
        this.toast.show('Transaction failed. Please try again.');
      },
    });
  }

  forgotPasscode() {
    this.toast.show('We sent an email to reset your passcode');
  }
}
