import { Component, computed, signal, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

import { TransactionsRow } from '../transactions-row/transactions-row';
import { Tx } from '../transactions-row/transaction.interface';
import { DateFilterPopup, QuickFilter } from '../date-filter-popup/date-filter-popup';
import { CurrencyFilterPopup } from '../currency-filter-popup/currency-filter-popup';

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [CommonModule, TableModule, TransactionsRow, DateFilterPopup, CurrencyFilterPopup],
  templateUrl: './transactions-table.html',
  styleUrl: './transactions-table.scss',
})
export class TransactionsTable {
  transactions = input.required<Tx[]>();

  // ✅ PAGINATION SIGNALS
  readonly rowsPerPage = 10;
  currentPage = signal(0);

  // ✅ FILTER SIGNALS
  appliedRange = signal<Date[] | null>(null);
  appliedQuickFilter = signal<QuickFilter>('all');
  selectedCurrency = signal<string | null>(null);

  // ✅ FILTERED DATA (DATE + CURRENCY)
  filteredTransactions = computed(() => {
    let txs = this.transactions();

    const filter = this.appliedQuickFilter();
    const range = this.appliedRange();

    if (filter === 'custom' && range?.[0]) {
      const start = new Date(range[0]);
      const end = range[1] ? new Date(range[1]) : new Date(range[0]);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      txs = txs.filter((tx) => {
        const d = new Date(tx.date);
        return d >= start && d <= end;
      });
    }

    const currency = this.selectedCurrency();
    if (currency) {
      txs = txs.filter((tx) => tx.currency === currency);
    }

    return txs;
  });

  // ✅ PAGINATED DATA (ONLY 10 SHOWN)
  paginatedTransactions = computed(() => {
    const start = this.currentPage() * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredTransactions().slice(start, end);
  });

  // ✅ RESET TO PAGE 0 WHEN FILTER CHANGES
  resetPaginationOnFilterChange = effect(() => {
    this.appliedRange();
    this.appliedQuickFilter();
    this.selectedCurrency();
    this.currentPage.set(0);
  });

  // ✅ BUTTON CONTROLS
  nextPage() {
    const maxPage = Math.ceil(this.filteredTransactions().length / this.rowsPerPage) - 1;

    if (this.currentPage() < maxPage) {
      this.currentPage.update((v) => v + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update((v) => v - 1);
    }
  }

  // ✅ FILTER HANDLERS
  onApplyFilter(event: { filter: QuickFilter; range: Date[] | null }) {
    this.appliedQuickFilter.set(event.filter);
    this.appliedRange.set(event.range);
  }

  onCurrencyFilter(currency: string | null) {
    this.selectedCurrency.set(currency);
  }
  // ✅ TOTAL PAGES
  totalPages = computed(() => {
    return Math.ceil(this.filteredTransactions().length / this.rowsPerPage);
  });

  // ✅ HUMAN-READABLE CURRENT PAGE (starts from 1)
  currentPageDisplay = computed(() => {
    return this.currentPage() + 1;
  });
}
