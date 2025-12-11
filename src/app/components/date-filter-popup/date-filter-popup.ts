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
    this.show.update(v => !v);
  }

  close() {
    this.show.set(false);
  }

  @HostListener('document:keydown.escape')
  closeOnEsc() {
    this.close();
  }

  filterToday() {
    const today = this.startOfDay(new Date());
    this.applyQuickFilter('today', today, today);
  }

  filterYesterday() {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const day = this.startOfDay(y);
    this.applyQuickFilter('yesterday', day, day);
  }

  filterCurrentWeek() {
    const start = this.getStartOfWeek(new Date());
    const end = this.endOfDay(new Date(start.getTime() + 6 * 86400000));
    this.applyQuickFilter('week', start, end);
  }

  filterCurrentMonth() {
    const now = new Date();
    const start = this.startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const end = this.endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    this.applyQuickFilter('month', start, end);
  }

  private applyQuickFilter(type: QuickFilter, start: Date, end: Date) {
    this.previewQuickFilter.set(type);
    this.selectedRange.set([start, end]);
    this.markRangeMiddle();
  }


  applyRange() {
    const range = this.selectedRange();

    if (range?.[0]) {
      this.apply.emit({ filter: 'custom', range: [...range] });
    } else {
      this.apply.emit({ filter: this.previewQuickFilter(), range: null });
    }

    this.close();
  }

  resetPeriod() {
    this.selectedRange.set(null);
    this.previewQuickFilter.set('all');

    this.apply.emit({ filter: 'all', range: null });

    this.close();
  }

  // ----------------------------------
  // CALENDAR MIDDLE-RANGE HIGHLIGHTING
  // ----------------------------------
  markRangeMiddle() {
    const range = this.selectedRange();
    if (!range || range.length !== 2) {
      this.clearMiddleClasses();
      return;
    }

    const startMs = this.toDayMs(range[0]);
    const endMs = this.toDayMs(range[1]);

    setTimeout(() => {
      const cells = document.querySelectorAll('td.p-datepicker-day-cell') as NodeListOf<HTMLTableCellElement>;

      cells.forEach(td => {
        td.classList.remove('range-middle');

        const dayElem = td.querySelector('.p-datepicker-day') as HTMLElement | null;
        if (!dayElem) return;

        const dateAttr = dayElem.getAttribute('data-date');
        if (!dateAttr) return;

        const [y, m, d] = dateAttr.split('-').map(Number);
        const cellMs = new Date(y, m, d).getTime(); // m is already correct (PrimeNG gives 0-based)

        if (cellMs > startMs && cellMs < endMs) {
          td.classList.add('range-middle');
        }
      });
    });
  }

  private clearMiddleClasses() {
    document
      .querySelectorAll('td.p-datepicker-day-cell.range-middle')
      .forEach(el => el.classList.remove('range-middle'));
  }

  // ----------------------------------
  // DATE HELPERS
  // ----------------------------------
  private startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private toDayMs(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  private getStartOfWeek(date: Date) {
    const d = this.startOfDay(date);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday = start
    return d;
  }
}
