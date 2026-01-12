import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wallet-transfer-menu',
  standalone: true,
  imports: [],
  templateUrl: './wallet-transfer-menu.html',
  styleUrl: './wallet-transfer-menu.scss',
})
export class WalletTransferMenu {
  constructor(private router: Router) {}

  goToSendWalletTransfer() {
    this.router.navigate(['/transfers/wallet-transfer/sendWalletTransfer']);
  }
  isActive(): boolean {
    return this.router.url.startsWith('/transfers/wallet-transfer');
  }
}
