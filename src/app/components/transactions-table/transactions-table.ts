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

  sortField = signal<string | null>(null);
  sortOrder = signal<1 | -1>(1);

  readonly rowsPerPage = 10;
  currentPage = signal(0);

  appliedRange = signal<Date[] | null>(null);
  appliedQuickFilter = signal<QuickFilter>('all');
  selectedCurrency = signal<string | null>(null);
  // explain
  filteredTransactions = computed(() => {
    let txs = [...this.transactions()];

    // ----------------------
    // DATE FILTER (custom)
    // ----------------------
    const filter = this.appliedQuickFilter();
    const range = this.appliedRange();
    // expalin
    if (filter === 'custom' && range?.[0]) {
      const start = new Date(range[0]);
      const end = new Date(range[1] ?? range[0]);

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      // explain
      txs = txs.filter((tx) => {
        const d = new Date(tx.date);
        return d >= start && d <= end;
      });
    }

    const currency = this.selectedCurrency();
    if (currency) {
      txs = txs.filter((tx) => tx.currency === currency);
    }

    const field = this.sortField();
    const order = this.sortOrder();

    if (field) {
      txs.sort((a, b) => {
        let valA: any = (a as any)[field];
        let valB: any = (b as any)[field];

        if (field === 'date') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
      });
    }

    return txs;
  });

  paginatedTransactions = computed(() => {
    const start = this.currentPage() * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredTransactions().slice(start, end);
  });

  resetPaginationOnFilterChange = effect(() => {
    this.appliedRange();
    this.appliedQuickFilter();
    this.selectedCurrency();
    this.currentPage.set(0);
  });
  // fix
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

  // ===========================
  // FILTER HANDLERS
  // ===========================
  onApplyFilter(event: { filter: QuickFilter; range: Date[] | null }) {
    this.appliedQuickFilter.set(event.filter);
    this.appliedRange.set(event.range);
  }

  onCurrencyFilter(currency: string | null) {
    this.selectedCurrency.set(currency);
  }

  sortBy(field: string) {
    if (this.sortField() === field) {
      this.sortOrder.update((v) => (v === 1 ? -1 : 1));
    } else {
      this.sortField.set(field);
      this.sortOrder.set(1);
    }
  }

  getSortIcon(field: string) {
    if (this.sortField() !== field) return 'pi pi-sort-alt';
    return this.sortOrder() === 1 ? 'pi pi-sort-amount-up' : 'pi pi-sort-amount-down';
  }

  totalPages = computed(() => Math.ceil(this.filteredTransactions().length / this.rowsPerPage));

  currentPageDisplay = computed(() => this.currentPage() + 1);
}
// add search button
