import { Component, Input } from '@angular/core';
import { TransactionsRow } from '../transactions-row/transactions-row';
import { CommonModule } from '@angular/common';
import { Tx } from '../transactions-row/transaction.interface';

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [TransactionsRow, CommonModule],
  templateUrl: './transactions-table.html',
  styleUrl: './transactions-table.scss',
})
export class TransactionsTable {
  @Input({ required: true }) transactions: Tx[] = [];
}
