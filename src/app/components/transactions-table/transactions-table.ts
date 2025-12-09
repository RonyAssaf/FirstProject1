import { Component, HostListener, Input, SimpleChanges } from '@angular/core';
import { TransactionsRow } from '../transactions-row/transactions-row';
import { Tx } from '../transactions-row/transaction.interface';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transactions-table',
  standalone: true,
  imports: [
    TransactionsRow,
    CommonModule,
    TableModule,
    ButtonModule,
    DatePickerModule,
    FormsModule,
  ],
  templateUrl: './transactions-table.html',
  styleUrl: './transactions-table.scss',
})
export class TransactionsTable {
  @Input({ required: true }) transactions: Tx[] = [];

  filteredTransactions: Tx[] = [];
  selectedRange: Date[] | null = null;
  showCalendar = false;

  activeQuickFilter: 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom' = 'all';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['transactions']) {
      this.filteredTransactions = [...this.transactions];
    }
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  closeCalendar() {
    this.showCalendar = false;
  }

  filterToday() {
    const today = new Date().toDateString();

    this.filteredTransactions = this.transactions.filter((tx) => tx.date.toDateString() === today);

    this.activeQuickFilter = 'today';
    this.closeCalendar();
  }

  filterYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    this.filteredTransactions = this.transactions.filter(
      (tx) => tx.date.toDateString() === yesterday.toDateString()
    );

    this.activeQuickFilter = 'yesterday';
    this.closeCalendar();
  }

  filterCurrentWeek() {
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    this.filteredTransactions = this.transactions.filter(
      (tx) => tx.date >= startOfWeek && tx.date <= endOfWeek
    );

    this.activeQuickFilter = 'week';
    this.closeCalendar();
  }

  filterCurrentMonth() {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    this.filteredTransactions = this.transactions.filter(
      (tx) => tx.date >= startOfMonth && tx.date <= endOfMonth
    );

    this.activeQuickFilter = 'month';
    this.closeCalendar();
  }

  applyRange() {
    if (!this.selectedRange || this.selectedRange.length < 2) return;

    const [start, end] = this.selectedRange;

    this.filteredTransactions = this.transactions.filter(
      (tx) => tx.date >= start && tx.date <= end
    );

    this.activeQuickFilter = 'custom';
    this.closeCalendar();
  }

  resetPeriod() {
    this.filteredTransactions = [...this.transactions];
    this.selectedRange = null;
    this.activeQuickFilter = 'all';
    this.closeCalendar();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeCalendar();
  }
}
