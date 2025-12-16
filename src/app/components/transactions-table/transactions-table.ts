import { Component, computed, signal, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

import { TransactionsRow } from '../transactions-row/transactions-row';
import { Tx } from '../transactions-row/transaction.interface';
import { DateFilterPopup, QuickFilter } from '../date-filter-popup/date-filter-popup';
import { CurrencyFilterPopup } from '../currency-filter-popup/currency-filter-popup';

import { isWithinInterval, startOfDay } from 'date-fns';
import { TxStatus } from '../currency-filter-popup/currency-filter-popup';

import {
  todayRange,
  rangeLength,
  shiftRangeByDays,
  deriveQuickFilter,
} from '@shared/utils/date-range.utils';

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [CommonModule, TableModule, TransactionsRow, DateFilterPopup, CurrencyFilterPopup],
  templateUrl: './transactions-table.html',
  styleUrl: './transactions-table.scss',
})
export class TransactionsTable {
  /* ================= INPUT ================= */
  transactions = input.required<Tx[]>();

  /* ================= STATE ================= */
  sortField = signal<string | null>(null);
  sortOrder = signal<1 | -1>(1);

  readonly rowsPerPage = 10;
  currentPage = signal(0);

  appliedRange = signal<Date[]>(todayRange());
  appliedQuickFilter = signal<QuickFilter>('today');

  // Updated to arrays for multi-select behavior
  selectedCurrencies = signal<string[]>([]);
  selectedStatuses = signal<TxStatus[]>([]);
  searchTerm = signal('');

  /* ================= FILTERED DATA ================= */

  filteredTransactions = computed(() => {
    let txs = [...this.transactions()];
    const [start, end] = this.appliedRange();
    txs = txs.filter((tx) => isWithinInterval(startOfDay(tx.date), { start, end }));
    if (this.selectedCurrencies().length) {
      txs = txs.filter((t) => this.selectedCurrencies().includes(t.currency));
    }
    if (this.selectedStatuses().length) {
      txs = txs.filter((t) => this.selectedStatuses().includes(t.status));
    }
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      txs = txs.filter(
        (t) =>
          t.id.toString().includes(term) ||
          t.from.toLowerCase().includes(term) ||
          t.to.toLowerCase().includes(term) ||
          t.type.toLowerCase().includes(term)
      );
    }
    if (this.sortField()) {
      const sortKey = this.sortField()!;
      const sortDirection = this.sortOrder();
      txs.sort((left: any, right: any) => {
        let leftValue = left[sortKey];
        let rightValue = right[sortKey];
        if (sortKey === 'date') {
          leftValue = new Date(leftValue).getTime();
          rightValue = new Date(rightValue).getTime();
        }
        if (leftValue < rightValue) return -1 * sortDirection;
        if (leftValue > rightValue) return 1 * sortDirection;
        return 0;
      });
    }
    return txs;
  });
  /* ================= PAGINATION ================= */

  paginatedTransactions = computed(() => {
    const start = this.currentPage() * this.rowsPerPage;
    return this.filteredTransactions().slice(start, start + this.rowsPerPage);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredTransactions().length / this.rowsPerPage))
  );

  currentPageDisplay = computed(() => this.currentPage() + 1);

  resetPagination = effect(() => {
    this.appliedQuickFilter();
    this.searchTerm();
    this.selectedCurrencies();
    this.selectedStatuses();
    this.currentPage.set(0);
  });

  prevPage() {
    if (this.currentPage() > 0) this.currentPage.update((v) => v - 1);
  }

  nextPage() {
    if (this.currentPage() + 1 < this.totalPages()) {
      this.currentPage.update((v) => v + 1);
    }
  }

  /* ================= DATE NAVIGATION ================= */

  previousDate() {
    this.shiftRange(-rangeLength(this.appliedRange()));
  }

  nextDate() {
    this.shiftRange(rangeLength(this.appliedRange()));
  }

  private shiftRange(days: number) {
    const nextRange = shiftRangeByDays(this.appliedRange(), days);
    const today = startOfDay(new Date());

    if (nextRange[1] > today) return;

    this.appliedRange.set(nextRange);
    this.appliedQuickFilter.set(deriveQuickFilter(nextRange));
  }

  /* ================= EVENTS ================= */

  onApplyFilter(event: { filter: QuickFilter; range: Date[] }) {
    this.appliedRange.set(event.range);
    this.appliedQuickFilter.set(deriveQuickFilter(event.range));
  }

  onCurrencyFilter(e: { currencies: string[]; statuses: TxStatus[] }) {
    this.selectedCurrencies.set(e.currencies);
    this.selectedStatuses.set(e.statuses);
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
}
