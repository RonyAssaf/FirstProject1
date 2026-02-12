import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Sidebar } from '../../components/sidebar/sidebar';
import { HeaderTransactions } from '../../shared/header-transactions/header-transactions';
import { Tx } from '../../components/transactions-row/transaction.interface';

import { TransactionsService } from '../transactions/transactions.service';
import { HttpErrorResponse } from '@angular/common/http';

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
export class TransactionDetails implements OnInit {
  tx: Tx | null = null;

  loading = true;
  errorMsg: string | null = null;

  details: DetailRow[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private txService: TransactionsService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading = false;
      this.errorMsg = 'Missing transaction id in route.';
      return;
    }

    // Optional: show instantly if we navigated with state (nice UX),
    // but still re-fetch from backend to keep it always correct.
    const stateTx = (history.state as any)?.tx as Tx | undefined;
    if (stateTx) {
      this.tx = stateTx;
      this.details = this.buildDetails(stateTx);
    }

    // ✅ Always fetch from backend by id
    this.loading = true;
    this.errorMsg = null;

    this.txService.getTransactionById(id).subscribe({
      next: (tx: Tx) => {
        this.tx = tx;
        this.details = this.buildDetails(tx);
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error('Failed to load transaction:', err);
        this.loading = false;

        const httpErr = err as HttpErrorResponse;
        const apiMsg = httpErr?.error?.message || httpErr?.error?.detail || httpErr?.message;

        this.errorMsg = apiMsg || 'Could not load transaction details.';
      },
    });
  }
  backToTransactions() {
    // keep your tableState restore logic (already stored in history.state)
    this.router.navigate(['/transactions'], {
      state: {
        ...history.state,
        fromDetails: true,
      },
    });
  }

  private buildDetails(tx: Tx): DetailRow[] {
    console.log('Fetching tx from backend by id:', tx.id);
    const currency = tx.currency || 'USD';

    return [
      {
        label: 'From',
        value: tx.from,
        icon: 'pi pi-user',
      },
      {
        label: 'To',
        value: tx.to,
        icon: 'pi pi-building',
      },
      {
        label: 'Total Amount',
        value: `${currency} ${Number(tx.total).toFixed(2)}`,
        icon: 'pi pi-wallet',
      },
      {
        label: 'Amount',
        value: `${currency} ${Number(tx.amount).toFixed(2)}`,
        icon: 'pi pi-credit-card',
      },
      {
        label: 'Fee',
        value: `${currency} ${Number(tx.fee).toFixed(2)}`,
        icon: 'pi pi-percentage',
        isFee: true,
      },
      {
        label: 'Date',
        value: new Date(tx.date).toLocaleString(),
        icon: 'pi pi-calendar',
      },
      {
        label: 'Status',
        value: tx.status,
        icon: 'pi pi-check-circle',
      },
      {
        label: 'Additional Details',
        value: tx.type,
        icon: 'pi pi-info-circle',
      },
    ];
  }
}
