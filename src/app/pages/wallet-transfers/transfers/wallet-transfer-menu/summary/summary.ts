import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

type TransferSummary = {
  currency: string;
  amount: number;

  // UI only
  recipientType: 'individual' | 'business';

  beneficiaryName?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  reason?: string;
};

// ✅ This is the backend-shaped object we must send to Passcode
type BackendTransferDraft = {
  currency: string;
  amount: number;
  recipientType: 'INDIVIDUAL' | 'BUSINESS';
  recipientPhone: string | null;
  recipientEmail: string | null;
  beneficiaryName: string | null;
  companyName: string | null;
  transferReason: string | null;
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

  // ✅ Keep original transfer for backend submit
  private backendTransfer!: BackendTransferDraft;

  constructor(private router: Router) {
    const state = history.state?.transfer;

    if (!state) {
      this.router.navigate(['/transfers/wallet-transfer/sendWalletTransfer']);
      return;
    }

    // ✅ state here is already the backend-shaped object coming from SendWalletTransfer
    this.backendTransfer = state as BackendTransferDraft;

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
    // ✅ Send backend-shaped transfer to passcode
    this.router.navigate(['/passcode'], {
      state: {
        transfer: this.backendTransfer,
      },
    });
  }
}
