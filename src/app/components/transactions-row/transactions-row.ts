import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tx } from './transaction.interface';

@Component({
  selector: 'tr[app-transactions-row]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions-row.html',
  styleUrl: './transactions-row.scss',
})
export class TransactionsRow {
  @Input({ required: true }) tx!: Tx;
  @Output() rowClick = new EventEmitter<Tx>();

  onClick() {
    this.rowClick.emit(this.tx);
  }

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
