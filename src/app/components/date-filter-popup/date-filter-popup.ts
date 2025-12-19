import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

import {
  startOfDay,
  addDays,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  min,
} from 'date-fns';

export type QuickFilter = 'today' | 'yesterday' | 'week' | 'month' | 'custom' | 'all'; // ✅ NEW

@Component({
  selector: 'app-date-filter-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule],
  templateUrl: './date-filter-popup.html',
  styleUrl: './date-filter-popup.scss',
})
export class DateFilterPopup {
  selectedQuick: 'today' | 'yesterday' | 'week' | 'month' | 'start' | null = 'today';
  @Input() range!: Date[];
  @Input() filter!: QuickFilter;
  today = startOfDay(new Date());

  @Output() apply = new EventEmitter<{
    filter: QuickFilter;
    range: Date[];
    allTime?: boolean;
  }>();
  show = false;

  /** TEMP RANGE shown in calendar */
  tempRange: Date[] = [];
  tempFilter: QuickFilter = 'custom';

  /* ================= TOGGLE ================= */

  toggle() {
    this.tempRange = [...this.range];
    this.tempFilter = this.filter;
    this.show = !this.show;
  }

  close() {
    this.show = false;
  }

  /* ================= QUICK FILTERS  ================= */

  applyToday() {
    this.selectedQuick = 'today';
    const today = startOfDay(new Date());
    this.tempRange = [today, today];
    this.tempFilter = 'today';
  }

  applyYesterday() {
    this.selectedQuick = 'yesterday';
    const yesterday = addDays(startOfDay(new Date()), -1);
    this.tempRange = [yesterday, yesterday];
    this.tempFilter = 'yesterday';
  }

  applyCurrentWeek() {
    this.selectedQuick = 'week';
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // ISO week
    const end = addDays(start, 6);
    this.tempRange = [startOfDay(start), startOfDay(end)];
    this.tempFilter = 'week';
  }

  applyCurrentMonth() {
    this.selectedQuick = 'month';
    const today = startOfDay(new Date());

    const start = startOfDay(startOfMonth(today));
    const monthEnd = startOfDay(endOfMonth(today));

    // Do not exceed today
    const end = min([monthEnd, today]);

    this.tempRange = [start, end];
    this.tempFilter = 'month';
  }

  /* ================= APPLY (DONE) ================= */

  applyRange() {
    //this.tempRange == null ? undefined : this.tempRange[0]
    if (!this.tempRange?.[0]) return;

    const start = startOfDay(this.tempRange[0]);
    const end = this.tempRange[1] ? startOfDay(this.tempRange[1]) : start;

    this.apply.emit({
      filter: this.tempFilter,
      range: [start, end],
    });

    this.close();
  }
  applyStartOfAccount() {
    this.selectedQuick = 'start';
    this.apply.emit({
      filter: 'all',
      range: [], // 🔥 explicitly empty
      allTime: true,
    });

    this.close();
  }

  /* ================= LABEL ================= */

  get label() {
    if (this.filter === 'all') return 'Start of account';
    if (this.filter === 'today') return 'Today';
    if (this.filter === 'yesterday') return 'Yesterday';
    if (this.filter === 'week') return 'Current week';
    if (this.filter === 'month') return 'Current month';

    const [s, e] = this.range;

    return isSameDay(s, e) ? this.format(s) : `${this.format(s)} — ${this.format(e)}`;
  }

  format(d: Date) {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  }

  /* ================= RESET ================= */

  resetPeriod() {
    this.selectedQuick = null;

    const today = startOfDay(new Date());

    this.apply.emit({
      filter: 'today',
      range: [today, today],
    });

    this.close();
  }

  isSameDay(a?: Date, b?: Date): boolean {
    if (!a || !b) return false;
    return isSameDay(a, b);
  }
  @HostListener('document:keydown.escape')
  closeOnEsc() {
    this.close();
  }
}
