import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

type TransferSummary = {
  currency: string;
  amount: number;
  recipientType: 'individual' | 'business';
  beneficiaryName?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  reason: string;
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

  fees = 0;

  constructor(private router: Router) {
    const state = history.state?.data;

    if (!state) {
      // Safety: user refreshed page
      this.router.navigate(['/transfers/wallet-transfer/sendWalletTransfer']);
      return;
    }

    this.data = state;
  }

  get totalAmount(): number {
    return this.data.amount + this.fees;
  }

  goBack() {
    this.router.navigate(['/transfers/wallet-transfer/sendWalletTransfer']);
  }

  confirm() {
    this.router.navigate(['/passcode']);
  }
}
