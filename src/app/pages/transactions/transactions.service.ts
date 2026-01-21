import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Tx } from '@components/transactions-row/transaction.interface';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly apiUrl = 'http://localhost:8080/transactions';

  constructor(private http: HttpClient) {}

  /* =========================
   * MAPPERS
   * ========================= */

  /** Normalize backend transaction to frontend Tx */
  private mapTx(tx: any): Tx {
    return {
      ...tx,
      from: tx.fromAccount,
      to: tx.toAccount,
    };
  }

  private mapTxList(rows: any[]): Tx[] {
    return rows.map((tx) => this.mapTx(tx));
  }

  /* =========================
   * GET USER TRANSACTIONS
   * ========================= */

  getTransactions(userId: string): Observable<Tx[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}?userId=${userId}`)
      .pipe(map((rows) => this.mapTxList(rows)));
  }

  getTransactionById(id: string): Observable<Tx> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map((tx) => this.mapTx(tx)));
  }

  /* =========================
   * PENDING TRANSFERS
   * ========================= */

  getPendingTransfers(userId: string): Observable<Tx[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/pending?userId=${userId}`)
      .pipe(map((rows) => this.mapTxList(rows)));
  }

  getPendingOutgoing(userId: number): Observable<Tx[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/pending-outgoing?userId=${userId}`)
      .pipe(map((rows) => this.mapTxList(rows)));
  }

  /* =========================
   * CREATE / TRANSFER
   * ========================= */

  // LEGACY CREATE transaction (KEEP — used elsewhere)
  createTransaction(payload: {
    userId: number;
    fromAccount: string;
    toAccount: string;
    currency: string;
    amount: number;
    total: number;
  }): Observable<unknown> {
    return this.http.post<unknown>(this.apiUrl, payload);
  }

  // NEW WALLET TRANSFER (after OTP)
  walletTransfer(payload: {
    fromUserId: string;
    recipientType: 'INDIVIDUAL' | 'BUSINESS';
    recipientPhone?: string;
    recipientEmail?: string;
    beneficiaryName?: string;
    companyName?: string;
    transferReason?: string;
    currency: string;
    amount: number;
  }): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/wallet-transfer`, payload);
  }

  /* =========================
   * ACTIONS
   * ========================= */

  acceptTransfer(id: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/${id}/accept`, {});
  }

  declineTransfer(id: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/${id}/decline`, {});
  }

  cancelTransfer(id: number): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
