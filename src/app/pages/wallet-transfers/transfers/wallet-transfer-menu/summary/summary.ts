import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

type TransferSummary = {
  currency: string;
  amount: number;

  // 👇 HTML EXPECTS LOWERCASE
  recipientType: 'individual' | 'business';

  // 👇 HTML EXPECTS THESE NAMES
  beneficiaryName?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  reason?: string;
};

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  data!: TransferSummary;

  // 👇 HTML USES `fees`
  fees = 0;

  constructor(private router: Router) {
    const state = history.state?.transfer;

    if (!state) {
      this.router.navigate(['/transfers/wallet-transfer/sendWalletTransfer']);
      return;
    }

    // =========================
    // NORMALIZE DATA FOR UI
    // =========================
    this.data = {
      currency: state.currency,
      amount: state.amount,

      recipientType: state.recipientType === 'INDIVIDUAL' ? 'individual' : 'business',

      beneficiaryName: state.beneficiaryName,
      phone: state.recipientPhone,
      email: state.recipientEmail,
      companyName: state.companyName,
      reason: state.transferReason,
    };
  }

  get totalAmount(): number {
    return this.data.amount + this.fees;
  }

  goBack() {
    this.router.navigate(['/transfers/wallet-transfer/sendWalletTransfer']);
  }

  confirm() {
    console.log(this.data);
    this.router.navigate(['/passcode'], {
      state: {
        transfer: this.data,
      },
    });
  }
}
