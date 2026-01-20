import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Sidebar } from '@components/sidebar/sidebar';
import { HeaderTransactions } from '@shared/header-transactions/header-transactions';
import { CurrentUserService } from 'src/app/core/servics/current-user.service';
import { Tx } from '@components/transactions-row/transaction.interface';
import { TransactionsService } from '../transactions/transactions.service';
import { DecimalPipe, DatePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [Sidebar, HeaderTransactions, DecimalPipe, DatePipe, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  pending: Tx[] = [];
  loading = false;

  // confirmation popup state
  confirmOpen = false;
  confirmAction: 'accept' | 'decline' | 'cancel' | null = null;

  selectedTx: Tx | null = null;

  constructor(
    private router: Router,
    private txService: TransactionsService,
    private currentUser: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.loadPending();
  }

  goToWalletTransfers() {
    this.router.navigate(['/transfers/wallet-transfer']);
  }

  loadPending() {
    const user = this.currentUser.getUser();
    if (!user?.id) return;

    this.loading = true;
    this.txService.getPendingTransfers(user.id).subscribe({
      next: (list) => {
        this.pending = list;
        this.loading = false;
      },
      error: () => {
        this.pending = [];
        this.loading = false;
      },
    });
  }

  // open confirm modal
  ask(action: 'accept' | 'decline' | 'cancel', tx: Tx) {
    this.confirmOpen = true;
    this.confirmAction = action;
    this.selectedTx = tx;
  }

  // close modal
  cancelConfirm() {
    this.confirmOpen = false;
    this.confirmAction = null;
    this.selectedTx = null;
  }

  // user clicked YES
  confirmYes() {
    if (!this.selectedTx?.id || !this.confirmAction) return;

    const id = this.selectedTx.id;

    let req$: any;

    if (this.confirmAction === 'accept') req$ = this.txService.acceptTransfer(id);
    else if (this.confirmAction === 'decline') req$ = this.txService.declineTransfer(id);
    else req$ = this.txService.cancelTransfer(id);

    req$.subscribe({
      next: () => {
        this.cancelConfirm();
        this.loadPending();
      },
      error: () => {
        this.cancelConfirm();
      },
    });
  }
}
