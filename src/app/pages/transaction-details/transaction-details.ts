import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Sidebar } from '../../components/sidebar/sidebar';
import { HeaderTransactions } from '../../shared/header-transactions/header-transactions';
import { Tx } from '../../components/transactions-row/transaction.interface';

type DetailRow = {
  label: string;
  value: string;
  icon: string; // PrimeIcon class
  isFee?: boolean;
};

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, HeaderTransactions],
  templateUrl: './transaction-details.html',
  styleUrl: './transaction-details.scss',
})
export class TransactionDetails {
  tx!: Tx;

  details: DetailRow[] = [];

  constructor() {
    const state = history.state;
    this.tx = state?.tx;

    if (this.tx) {
      this.details = [
        {
          label: 'From',
          value: this.tx.from,
          icon: 'pi pi-user',
        },
        {
          label: 'To',
          value: this.tx.to,
          icon: 'pi pi-building',
        },
        {
          label: 'Total Amount',
          value: `USD ${this.tx.total.toFixed(2)}`,
          icon: 'pi pi-wallet',
        },
        {
          label: 'Amount',
          value: `USD ${this.tx.amount.toFixed(2)}`,
          icon: 'pi pi-credit-card',
        },
        {
          label: 'Fee',
          value: `USD ${this.tx.fee.toFixed(2)}`,
          icon: 'pi pi-percentage',
          isFee: true,
        },
        {
          label: 'Date',
          value: new Date(this.tx.date).toLocaleString(),
          icon: 'pi pi-calendar',
        },
        {
          label: 'Status',
          value: this.tx.status,
          icon: 'pi pi-check-circle',
        },
        {
          label: 'Additional Details',
          value: this.tx.type,
          icon: 'pi pi-info-circle',
        },
      ];
    }
  }
}
