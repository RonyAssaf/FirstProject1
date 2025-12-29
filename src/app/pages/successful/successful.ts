import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-successful',
  imports: [],
  templateUrl: './successful.html',
  styleUrl: './successful.scss',
})
export class Successful {
  beneficiaryName = 'hayssam mawla';
  constructor(private router: Router) {}

  goToWalletTransfers() {
    this.router.navigate(['/transfers/wallet-transfer']);
  }
}
