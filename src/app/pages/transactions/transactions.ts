import { Component, OnInit } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { TransactionsTable } from '../../components/transactions-table/transactions-table';
import { HeaderTransactions } from '../../shared/header-transactions/header-transactions';
import { Tx } from '../../components/transactions-row/transaction.interface';
import { TransactionsService } from './transactions.service';
import { CurrentUserService } from 'src/app/core/servics/current-user.service';

@Component({
  selector: 'app-transactions',
  imports: [Sidebar, TransactionsTable, HeaderTransactions],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  currentSection = 'Transactions';
  transactions: Tx[] = [];
  constructor(private txService: TransactionsService, private currentUser: CurrentUserService) {}

  ngOnInit(): void {
    const user = this.currentUser.getUser();

    if (!user?.id) {
      console.error('No logged-in user found');
      return;
    }

    const userId = user.id;

    this.txService.getTransactions(userId).subscribe({
      next: (data) => {
        this.transactions = data;
      },
      error: (err) => {
        console.error('Failed to load transactions', err);
      },
    });
  }
}
