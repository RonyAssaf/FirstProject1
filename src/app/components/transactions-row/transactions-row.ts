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

  getFlagCode(currency: string): string {
    switch (currency) {
      case 'USD':
        return 'us';
      case 'EUR':
        return 'eu';
      case 'LBP':
        return 'lb';
      default:
        return 'us';
    }
  }
}
