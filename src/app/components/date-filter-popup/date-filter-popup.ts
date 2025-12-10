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

  toggle() {
    this.show.update((v) => !v);
  }

  close() {
    this.show.set(false);
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.close();
  }
  filterToday() {
    const today = new Date();
    this.previewQuickFilter.set('today');
    this.selectedRange.set([today, today]);

    this.markRangeMiddle(); // ✅ REQUIRED
  }

  filterYesterday() {
    const y = new Date();
    y.setDate(y.getDate() - 1);

    this.previewQuickFilter.set('yesterday');
    this.selectedRange.set([y, y]);

    this.markRangeMiddle(); // ✅ REQUIRED
  }

  filterCurrentWeek() {
    const start = this.getStartOfWeek(new Date());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    this.previewQuickFilter.set('week');
    this.selectedRange.set([start, end]);

    this.markRangeMiddle(); // ✅ REQUIRED
  }

  filterCurrentMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.previewQuickFilter.set('month');
    this.selectedRange.set([start, end]);

    this.markRangeMiddle(); // ✅ REQUIRED
  }

  // ✅ APPLY BUTTON
  applyRange() {
    const range = this.selectedRange();

    if (range?.[0]) {
      this.apply.emit({
        filter: 'custom',
        range: [...range],
      });
    } else {
      this.apply.emit({
        filter: this.previewQuickFilter(),
        range: null,
      });
    }

    this.close();
  }

  resetPeriod() {
    this.selectedRange.set(null);
    this.previewQuickFilter.set('all');

    this.apply.emit({
      filter: 'all',
      range: null,
    });

    this.close();
  }

  // ✅ HELPERS
  private getStartOfWeek(date: Date) {
    const d = new Date(date);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ✅ RANGE MIDDLE FIX
  markRangeMiddle() {
    const range = this.selectedRange();

    if (!range || range.length !== 2) {
      // optional: clear previous middles
      document
        .querySelectorAll('td.p-datepicker-day-cell.range-middle')
        .forEach((el) => el.classList.remove('range-middle'));
      return;
    }

    const startMs = new Date(
      range[0].getFullYear(),
      range[0].getMonth(),
      range[0].getDate()
    ).getTime();

    const endMs = new Date(
      range[1].getFullYear(),
      range[1].getMonth(),
      range[1].getDate()
    ).getTime();

    setTimeout(() => {
      const cells = document.querySelectorAll(
        'td.p-datepicker-day-cell'
      ) as NodeListOf<HTMLTableCellElement>;

      cells.forEach((td) => {
        td.classList.remove('range-middle');

        const span = td.querySelector('.p-datepicker-day') as HTMLElement | null;
        if (!span) return;

        const dateAttr = span.getAttribute('data-date');
        if (!dateAttr) return;

        const [y, m, d] = dateAttr.split('-').map(Number);

        // 🔥 IMPORTANT: m is already 0-based from PrimeNG → no -1 here
        const cellMs = new Date(y, m, d).getTime();

        if (cellMs > startMs && cellMs < endMs) {
          td.classList.add('range-middle');
        }
      });
    }, 0);
  }
}
