import { Component, OnInit } from '@angular/core';
import { Sidebar } from '../../components/sidebar/sidebar';
import { TransactionsTable } from '../../components/transactions-table/transactions-table';
import { HeaderTransactions } from '../../shared/header-transactions/header-transactions';
import { Tx } from '../../components/transactions-row/transaction.interface';
import { TransactionsService } from './transactions.service';

@Component({
  selector: 'app-transactions',
  imports: [Sidebar, TransactionsTable, HeaderTransactions],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  currentSection = 'Transactions';
  transactions: Tx[] = [];
  constructor(private txService: TransactionsService) {}

  ngOnInit(): void {
    this.txService.getTransactions().subscribe((data) => {
      this.transactions = data;
    });
  }
}
