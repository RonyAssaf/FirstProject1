import { Component, signal, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

export type QuickFilter = 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom';

@Component({
  selector: 'app-date-filter-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule],
  templateUrl: './date-filter-popup.html',
  styleUrl: './date-filter-popup.scss',
})
export class DateFilterPopup {
  @Output() apply = new EventEmitter<{
    filter: QuickFilter;
    range: Date[] | null;
  }>();

  show = signal(false);
  selectedRange = signal<Date[] | null>(null);
  previewQuickFilter = signal<QuickFilter>('all');
  triggerLabel = signal('Start of account');

  /* OPEN / CLOSE */
  toggle() {
    this.show.update((v) => !v);
  }

  close() {
    this.show.set(false);
  }

  @HostListener('document:keydown.escape')
  closeOnEsc() {
    this.close();
  }

  /* QUICK FILTERS */
  filterToday() {
    const d = this.startOfDay(new Date());
    this.setQuickFilter('today', [d, d], 'Today');
  }

  filterYesterday() {
    const d = this.startOfDay(new Date());
    d.setDate(d.getDate() - 1);
    this.setQuickFilter('yesterday', [d, d], 'Yesterday');
  }

  filterCurrentWeek() {
    const start = this.getStartOfWeek(new Date());
    const end = this.endOfDay(new Date(start.getTime() + 6 * 86400000));
    this.setQuickFilter('week', [start, end], 'Current week');
  }

  filterCurrentMonth() {
    const now = new Date();
    const start = this.startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const end = this.endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    this.setQuickFilter('month', [start, end], 'Current month');
  }

  private setQuickFilter(type: QuickFilter, range: Date[], label: string) {
    this.previewQuickFilter.set(type);
    this.selectedRange.set(range);
    this.triggerLabel.set(label);
  }

  /* APPLY */
  applyRange() {
    const range = this.selectedRange();
    if (!range?.[0]) {
      this.resetPeriod();
      return;
    }

    const matched = this.detectQuickFilter(range);

    if (matched) {
      this.previewQuickFilter.set(matched.type);
      this.triggerLabel.set(matched.label);
      this.apply.emit({ filter: matched.type, range });
    } else {
      this.previewQuickFilter.set('custom');
      this.triggerLabel.set(this.formatRangeLabel(range));
      this.apply.emit({ filter: 'custom', range });
    }

    this.close();
  }

  /* RESET */
  resetPeriod() {
    this.selectedRange.set(null);
    this.previewQuickFilter.set('all');
    this.triggerLabel.set('Start of account');
    this.apply.emit({ filter: 'all', range: null });
    this.close();
  }

  /* 🔍 QUICK FILTER DETECTION */
  private detectQuickFilter(range: Date[]) {
    const [start, end] = range.map((d) => this.toDayMs(d));
    const today = this.toDayMs(new Date());

    const yesterday = this.toDayMs(new Date(new Date().setDate(new Date().getDate() - 1)));

    const weekStart = this.toDayMs(this.getStartOfWeek(new Date()));
    const weekEnd = this.toDayMs(
      new Date(this.getStartOfWeek(new Date()).getTime() + 6 * 86400000)
    );

    const monthStart = this.toDayMs(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    const monthEnd = this.toDayMs(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

    if (start === today && end === today) {
      return { type: 'today' as QuickFilter, label: 'Today' };
    }

    if (start === yesterday && end === yesterday) {
      return { type: 'yesterday' as QuickFilter, label: 'Yesterday' };
    }

    if (start === weekStart && end === weekEnd) {
      return { type: 'week' as QuickFilter, label: 'Current week' };
    }

    if (start === monthStart && end === monthEnd) {
      return { type: 'month' as QuickFilter, label: 'Current month' };
    }

    return null;
  }

  /* LABEL HELPERS */
  get isSingleDate() {
    const r = this.selectedRange();
    if (!r || !r[0]) return false;
    if (!r[1]) return true;
    return this.toDayMs(r[0]) === this.toDayMs(r[1]);
  }

  formatLabel(d: Date) {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  }

  formatRangeLabel(range: Date[]) {
    return this.isSingleDate
      ? this.formatLabel(range[0])
      : `${this.formatLabel(range[0])} — ${this.formatLabel(range[1])}`;
  }

  /* DATE HELPERS */
  private startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private endOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  }

  private toDayMs(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  private getStartOfWeek(date: Date) {
    const d = this.startOfDay(date);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }
}
