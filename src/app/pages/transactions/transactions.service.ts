import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { Tx } from '../../components/transactions-row/transaction.interface';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  constructor(private http: HttpClient) {}

  getFakeTransactions() {
    return this.http
      .get<any>('https://dummyjson.com/users?limit=100')
      .pipe(map((res) => this.transformUsersToTx(res.users)));
  }

  private transformUsersToTx(users: any[]): Tx[] {
    const statuses: Tx['status'][] = ['Completed', 'Pending', 'Failed'];
    const currencies = ['USD', 'LBP', 'EUR'];

    return users.map((user, index): Tx => {
      const amount = this.random(-500, 500);
      const fee = this.random(0, 5);

      return {
        id: 108300 + index,

        date: this.getYesterdayPlusIndex(index),

        from: `${user.firstName} ${user.lastName}`,
        to: user.company?.name,
        type: index % 2 === 0 ? 'Wallet Transfer' : 'Transfer via Mobile Number',
        status: statuses[this.random(0, 2)],
        currency: currencies[this.random(0, 2)],
        total: amount + fee,
        amount,
        fee,
        countryCode: user.address?.countryCode || 'US',
      };
    });
  }

  private random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ✅ RETURNS REAL DATE
  private getYesterdayPlusIndex(index: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - 1 + index);
    return date;
  }
}
