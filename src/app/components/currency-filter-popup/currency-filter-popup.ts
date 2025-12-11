import { Component, signal, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-currency-filter-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-filter-popup.html',
  styleUrl: './currency-filter-popup.scss',
})
export class CurrencyFilterPopup {
  isOpen = signal(false);

  selectedCurrency = signal<string | null>(null);

  apply = output<string | null>();

  toggle() {
    this.isOpen.update((open) => !open);
  }

  select(currency: string) {
    this.selectedCurrency.set(currency);
  }

  onDone() {
    this.apply.emit(this.selectedCurrency());
    this.isOpen.set(false);
  }

  onReset() {
    this.selectedCurrency.set(null);
    this.apply.emit(null);
    this.isOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeOnEsc() {
    this.isOpen.set(false);
  }
}
