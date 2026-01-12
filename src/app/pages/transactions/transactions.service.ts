import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Tx } from '@components/transactions-row/transaction.interface';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly apiUrl = 'http://localhost:8080/transactions';

  constructor(private http: HttpClient) {}

  // =========================
  // GET user transactions
  // =========================
  getTransactions(userId: number): Observable<Tx[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`).pipe(
      map((rows) =>
        rows.map((tx) => ({
          ...tx,
          from: tx.fromAccount,
          to: tx.toAccount,
        }))
      )
    );
  }

  // =========================
  // LEGACY CREATE transaction
  // (KEEP — used elsewhere)
  // =========================
  createTransaction(payload: {
    userId: number;
    fromAccount: string;
    toAccount: string;
    currency: string;
    amount: number;
    total: number;
  }): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  // =========================
  // NEW WALLET TRANSFER
  // CALLED ONLY AFTER OTP
  // =========================
  walletTransfer(payload: {
    fromUserId: number;

    recipientType: 'INDIVIDUAL' | 'BUSINESS';
    recipientPhone?: string;
    recipientEmail?: string;

    beneficiaryName?: string;
    companyName?: string;
    transferReason?: string;

    currency: string;
    amount: number;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/wallet-transfer`, payload);
  }
}
