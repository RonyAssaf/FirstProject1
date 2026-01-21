import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { TransactionsTable } from '../../components/transactions-table/transactions-table';
import { HeaderTransactions } from '../../shared/header-transactions/header-transactions';
import { Tx } from '../../components/transactions-row/transaction.interface';
import { TransactionsService } from './transactions.service';
import { CurrentUserService } from 'src/app/core/servics/current-user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-transactions',
  imports: [Sidebar, TransactionsTable, HeaderTransactions],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  transactions: Tx[] = [];

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private txService: TransactionsService,
    private currentUser: CurrentUserService,
  ) {}

  ngOnInit(): void {
    const userId = this.getLoggedInUserId();
    if (!userId) {
      console.error('No logged-in user found');
      return;
    }

    this.txService
      .getTransactions(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => (this.transactions = data),
        error: (err) => console.error('Failed to load transactions', err),
      });
  }

  private getLoggedInUserId(): string | null {
    return this.currentUser.getUser()?.id ?? null;
  }
}
