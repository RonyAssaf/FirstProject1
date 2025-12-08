import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-transactions',
  imports: [CommonModule],
  templateUrl: './header-transactions.html',
  styleUrl: './header-transactions.scss',
})
export class HeaderTransactions {
  @Input() title: string = 'Transactions';
}
