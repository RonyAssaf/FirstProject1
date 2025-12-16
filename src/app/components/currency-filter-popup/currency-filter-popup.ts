import { Component, signal, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TxStatus = 'Completed' | 'Pending' | 'Failed';

@Component({
  selector: 'app-currency-filter-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-filter-popup.html',
  styleUrl: './currency-filter-popup.scss',
})
export class CurrencyFilterPopup {
  isOpen = signal(false);

  // ✅ multi-select state
  selectedCurrencies = signal<string[]>([]);
  selectedStatuses = signal<TxStatus[]>([]);

  // ✅ emit arrays instead of single values
  apply = output<{ currencies: string[]; statuses: TxStatus[] }>();

  toggle() {
    this.isOpen.update((open) => !open);
  }

  /* ================= MULTI-SELECT TOGGLES ================= */

  toggleCurrency(currency: string) {
    this.selectedCurrencies.update((list) =>
      list.includes(currency) ? list.filter((c) => c !== currency) : [...list, currency]
    );
  }

  toggleStatus(status: TxStatus) {
    this.selectedStatuses.update((list) =>
      list.includes(status) ? list.filter((s) => s !== status) : [...list, status]
    );
  }

  /* ================= ACTIONS ================= */

  onDone() {
    this.apply.emit({
      currencies: this.selectedCurrencies(),
      statuses: this.selectedStatuses(),
    });
    this.isOpen.set(false);
  }

  onReset() {
    this.selectedCurrencies.set([]);
    this.selectedStatuses.set([]);
    this.apply.emit({ currencies: [], statuses: [] });
    this.isOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeOnEsc() {
    this.isOpen.set(false);
  }
}
