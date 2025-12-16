import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

import { Tx } from '../../components/transactions-row/transaction.interface';

// ✅ Import local financial mock data
import financialData from '../../../api.json';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  constructor(private http: HttpClient) {}

  /**
   * 🔹 Fetch users from DummyJSON
   * 🔹 Merge with local api.json financial data
   * 🔹 Return final Tx[]
   */
  getTransactions() {
    return this.http
      .get<any>('https://dummyjson.com/users?limit=200')
      .pipe(map((res) => this.mergeWithFinancialData(res.users)));
  }

  /**
   * 🔹 Merge identity data + financial data
   * 🔹 Convert date string → Date object
   */
  private mergeWithFinancialData(users: any[]): Tx[] {
    const statuses: Tx['status'][] = ['Completed', 'Pending', 'Failed'];
    const currencies: Tx['currency'][] = ['USD', 'LBP', 'EUR'];

    return users.map((user, index): Tx => {
      const finance = financialData.transactions[index];

      return {
        // =========================
        // FROM LOCAL api.json
        // =========================
        id: finance.id,
        amount: finance.amount,
        total: finance.total,
        fee: finance.fee,
        date: new Date(finance.date), // ✅ string → Date

        // =========================
        // FROM DUMMYJSON
        // =========================
        from: `${user.firstName} ${user.lastName}`,
        to: user.company?.name ?? '—',
        type: index % 2 === 0 ? 'Wallet Transfer' : 'Transfer via Mobile Number',
        status: statuses[this.random(0, statuses.length - 1)],
        currency: currencies[this.random(0, currencies.length - 1)],
        countryCode: user.address?.countryCode || 'US',
      };
    });
  }

  // =========================
  // UTIL
  // =========================
  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
