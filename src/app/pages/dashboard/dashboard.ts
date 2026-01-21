import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Sidebar } from '@components/sidebar/sidebar';
import { HeaderTransactions } from '@shared/header-transactions/header-transactions';
import { CurrentUserService } from 'src/app/core/servics/current-user.service';
import { Tx } from '@components/transactions-row/transaction.interface';
import { TransactionsService } from '../transactions/transactions.service';
import { DecimalPipe, DatePipe, CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

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

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private txService: TransactionsService,
    private currentUser: CurrentUserService,
  ) {}

  ngOnInit(): void {
    this.loadPending();
  }

  goToWalletTransfers(): void {
    this.router.navigate(['/transfers/wallet-transfer']);
  }

  /* ================= DATA LOADING ================= */

  loadPending(): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    this.loading = true;

    // takeUntilDestroyed automatically unsubscribes from
    //  observables when the component is destroyed, preventing memory
    // leaks. It doesn’t change behavior, but it makes the component safer and more robust.
    this.txService
      .getPendingTransfers(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

  private getCurrentUserId(): string | null {
    return this.currentUser.getUser()?.id ?? null;
  }

  /* ================= CONFIRM MODAL ================= */

  ask(action: 'accept' | 'decline' | 'cancel', tx: Tx): void {
    this.confirmOpen = true;
    this.confirmAction = action;
    this.selectedTx = tx;
  }

  cancelConfirm(): void {
    this.confirmOpen = false;
    this.confirmAction = null;
    this.selectedTx = null;
  }

  confirmYes(): void {
    if (!this.selectedTx?.id || !this.confirmAction) return;

    const request$ = this.getActionRequest(this.confirmAction, this.selectedTx.id);
    if (!request$) return;

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.cancelConfirm();
        this.loadPending();
      },
      error: () => {
        this.cancelConfirm();
      },
    });
  }

  private getActionRequest(
    action: 'accept' | 'decline' | 'cancel',
    txId: number,
  ): Observable<unknown> {
    switch (action) {
      case 'accept':
        return this.txService.acceptTransfer(txId);
      case 'decline':
        return this.txService.declineTransfer(txId);
      case 'cancel':
        return this.txService.cancelTransfer(txId);
    }
  }
}
