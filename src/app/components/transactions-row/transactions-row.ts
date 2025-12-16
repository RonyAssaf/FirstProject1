import { Component, Input } from '@angular/core';
import { Tx } from './transaction.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tr[app-transactions-row]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-row.html',
  styleUrl: './transactions-row.scss',
})
export class TransactionsRow {
  @Input({ required: true }) tx!: Tx;

  getFlagPath(currency: Tx['currency']): string {
    const normalized = currency?.trim().toUpperCase();

    switch (normalized) {
      case 'USD':
        return '/UsFlag.png';
      case 'EUR':
        return '/EuroFlag.png';
      case 'LBP':
        return '/LbFlag.png';
      default:
        return '';
    }
  }
}
