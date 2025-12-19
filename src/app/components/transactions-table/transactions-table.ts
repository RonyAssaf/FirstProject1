import { Component, computed, signal, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';

import { TransactionsRow } from '../transactions-row/transactions-row';
import { Tx } from '../transactions-row/transaction.interface';
import { DateFilterPopup, QuickFilter } from '../date-filter-popup/date-filter-popup';
import { CurrencyFilterPopup } from '../currency-filter-popup/currency-filter-popup';
import { TxStatus } from '../currency-filter-popup/currency-filter-popup';

import { isWithinInterval, startOfDay, addMonths, startOfMonth, endOfMonth } from 'date-fns';

import {
  todayRange,
  rangeLength,
  shiftRangeByDays,
  deriveQuickFilter,
} from '@shared/utils/date-range.utils';

/* ================= TABLE STATE SNAPSHOT ================= */
/** Persisted table state when navigating to details */
type TableState = {
  page: number;
  search: string;
  sortField: string | null;
  sortOrder: 1 | -1;
  currencies: string[];
  statuses: TxStatus[];
  range: Date[];
  isAllTime: boolean;
  quickFilter: QuickFilter;
  navigationMode: 'day' | 'week' | 'month' | 'custom';
};

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [CommonModule, TableModule, TransactionsRow, DateFilterPopup, CurrencyFilterPopup],
  templateUrl: './transactions-table.html',
  styleUrl: './transactions-table.scss',
})
export class TransactionsTable {
  /* ================= INPUT ================= */
  /** Full list of transactions */
  transactions = input.required<Tx[]>();

  constructor(private router: Router) {
    /** Restore table state when coming back from details page */
    const state = history.state as {
      tableState?: TableState;
      fromDetails?: boolean;
    };

    if (state?.tableState && state?.fromDetails) {
      const s = state.tableState;

      this.currentPage.set(s.page);
      this.searchTerm.set(s.search);
      this.sortField.set(s.sortField);
      this.sortOrder.set(s.sortOrder);
      this.selectedCurrencies.set(s.currencies);
      this.selectedStatuses.set(s.statuses);
      this.appliedRange.set((s.range ?? []).map((d) => new Date(d)));
      this.isAllTime.set(s.isAllTime);
      this.appliedQuickFilter.set(s.quickFilter);
      this.navigationMode.set(s.navigationMode);

      // Remove restore markers so refresh doesn't rehydrate again
      const { tableState, fromDetails, ...rest } = history.state ?? {};
      history.replaceState(rest, '');
    }
  }

  /* ================= STATE ================= */

  /** Sorting */
  sortField = signal<string | null>(null);
  sortOrder = signal<1 | -1>(1);

  /** Date navigation mode (affects prev / next behavior) */
  navigationMode = signal<'day' | 'week' | 'month' | 'custom'>('day');

  /** Pagination */
  readonly rowsPerPage = 10;
  currentPage = signal(0);

  /** Date filters */
  appliedRange = signal<Date[]>(todayRange());
  appliedQuickFilter = signal<QuickFilter>('today');
  isAllTime = signal(false);

  /** Currency / status filters */
  selectedCurrencies = signal<string[]>([]);
  selectedStatuses = signal<TxStatus[]>([]);

  /** Search */
  searchTerm = signal('');

  /** Today (clamped for future dates) */
  private readonly today = startOfDay(new Date());

  /* ================= FILTERED DATA ================= */

  /** Applies date, currency, status, search, and sorting */
  filteredTransactions = computed(() => {
    let txs = [...this.transactions()];

    // Date filtering (unless "All time")
    if (!this.isAllTime()) {
      const [start, end] = this.appliedRange();
      const effectiveEnd = end > this.today ? this.today : end;

      txs = txs.filter((tx) => isWithinInterval(startOfDay(tx.date), { start, end: effectiveEnd }));
    }

    // Currency filter
    if (this.selectedCurrencies().length) {
      txs = txs.filter((t) => this.selectedCurrencies().includes(t.currency));
    }

    // Status filter
    if (this.selectedStatuses().length) {
      txs = txs.filter((t) => this.selectedStatuses().includes(t.status));
    }

    // Search filter
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

    // Sorting
    if (this.sortField()) {
      const field = this.sortField()!;
      const order = this.sortOrder();

      txs.sort((a: any, b: any) => {
        let av = a[field];
        let bv = b[field];

        if (field === 'date') {
          av = new Date(av).getTime();
          bv = new Date(bv).getTime();
        }

        return av < bv ? -order : av > bv ? order : 0;
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

  /* ================= RESET PAGE ON FILTER CHANGE ================= */

  private hydrated = false;

  /** Reset pagination when filters change (but not on restore) */
  resetPagination = effect(() => {
    this.appliedQuickFilter();
    this.searchTerm();
    this.selectedCurrencies();
    this.selectedStatuses();
    this.isAllTime();
    this.appliedRange();

    if (!this.hydrated) {
      this.hydrated = true;
      return;
    }

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

  /** Shift range by whole months */
  private shiftMonth(range: Date[], delta: number): [Date, Date] {
    const base = addMonths(range[0], delta);
    return [startOfMonth(base), endOfMonth(base)];
  }

  previousDate() {
    this.navigate(-1);
  }

  nextDate() {
    this.navigate(1);
  }

  /** Centralized date navigation logic */
  private navigate(direction: -1 | 1) {
    const range = this.appliedRange();
    let nextRange: [Date, Date];

    switch (this.navigationMode()) {
      case 'month':
        nextRange = this.shiftMonth(range, direction);
        break;
      case 'week':
        nextRange = shiftRangeByDays(range, 7 * direction);
        break;
      case 'day':
        nextRange = shiftRangeByDays(range, direction);
        break;
      default:
        nextRange = shiftRangeByDays(range, rangeLength(range) * direction);
    }

    // Prevent navigating into the future
    if (nextRange[0] > this.today) return;

    this.appliedRange.set(nextRange);
    this.appliedQuickFilter.set(deriveQuickFilter(nextRange));
  }

  /* ================= FILTER EVENTS ================= */

  onApplyFilter(event: { filter: QuickFilter; range: Date[]; allTime?: boolean }) {
    if (event.filter === 'all') {
      this.isAllTime.set(true);
      this.appliedRange.set([]);
      this.appliedQuickFilter.set('all');
      this.navigationMode.set('custom');
      return;
    }

    this.isAllTime.set(false);
    this.appliedRange.set(event.range);
    this.appliedQuickFilter.set(event.filter);

    switch (event.filter) {
      case 'month':
        this.navigationMode.set('month');
        break;
      case 'week':
        this.navigationMode.set('week');
        break;
      case 'today':
      case 'yesterday':
        this.navigationMode.set('day');
        break;
      default:
        this.navigationMode.set('custom');
    }
  }

  onCurrencyFilter(e: { currencies: string[]; statuses: TxStatus[] }) {
    this.selectedCurrencies.set(e.currencies);
    this.selectedStatuses.set(e.statuses);
  }

  /* ================= SORTING ================= */

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

  /* ================= DISPLAY HELPERS ================= */

  /** Clamp displayed end date to today */
  displayRange = computed(() => {
    const [start, end] = this.appliedRange();
    return [start, end > this.today ? this.today : end];
  });

  /* ================= DETAILS NAVIGATION ================= */

  openTransactionDetails(tx: Tx) {
    // Persist table state on current history entry
    history.replaceState(
      {
        ...history.state,
        tableState: this.getTableState(),
        fromDetails: true,
      },
      ''
    );

    // Navigate to details page
    this.router.navigate(['/transactions', tx.id], {
      state: { tx },
    });
  }

  /* ================= STATE SNAPSHOT ================= */

  private getTableState(): TableState {
    return {
      page: this.currentPage(),
      search: this.searchTerm(),
      sortField: this.sortField(),
      sortOrder: this.sortOrder(),
      currencies: this.selectedCurrencies(),
      statuses: this.selectedStatuses(),
      range: this.appliedRange(),
      isAllTime: this.isAllTime(),
      quickFilter: this.appliedQuickFilter(),
      navigationMode: this.navigationMode(),
    };
  }
}
