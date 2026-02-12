import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

// ✅ IMPORTANT: use the SINGLE Tx type used by your UI
import { Tx } from '../../components/transactions-row/transaction.interface';

/* =====================
 * API ENVELOPE
 * ===================== */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/* =====================
 * BACKEND TX SHAPE (what backend sends)
 * ===================== */
type BackendTx = {
  id: string;
  toUserId: string | null;
  recipientType: string;
  recipientPhone?: string | null;
  recipientEmail?: string | null;
  fromAccount: string;
  toAccount: string;
  type: string;
  status: string;
  currency: string;
  amount: number;
  fee: number;
  total: number;
  date: string;
  beneficiaryName?: string | null;
  companyName?: string | null;
  transferReason?: string | null;
  transferRef?: string | null;
};

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/transactions`;

  constructor(private http: HttpClient) {}

  /* =====================
   * READ
   * ===================== */

  // ✅ Your Transactions page uses this
  getTransactions(userId: string): Observable<Tx[]> {
    // backend uses auth, but keeping param doesn't hurt if your backend ignores it
    const params = new HttpParams().set('userId', userId);

    return this.http.get<ApiResponse<BackendTx[]>>(this.baseUrl, { params }).pipe(
      map((res) => (Array.isArray(res?.data) ? res.data : [])),
      map((rows) => rows.map((t) => this.mapTx(t, userId))),
    );
  }

  // ✅ Keep old name in case some pages still call it
  getUserTransactions(userId: string): Observable<Tx[]> {
    return this.getTransactions(userId);
  }

  getPendingTransfers(userId: string): Observable<Tx[]> {
    const params = new HttpParams().set('userId', userId);

    return this.http.get<ApiResponse<BackendTx[]>>(`${this.baseUrl}/pending`, { params }).pipe(
      map((res) => (Array.isArray(res?.data) ? res.data : [])),
      map((rows) => rows.map((t) => this.mapTx(t, userId))),
    );
  }

  getTransactionById(id: string): Observable<Tx> {
    return this.http.get<ApiResponse<BackendTx>>(`${this.baseUrl}/${id}`).pipe(
      map((res) => res.data),
      map((t) => this.mapTx(t, null)),
    );
  }

  /* =====================
   * ACTIONS (Dashboard buttons)
   * backend: POST /transactions/{id}/{action}
   * ===================== */

  acceptTransfer(txId: string): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/${txId}/accept`, {})
      .pipe(map(() => void 0));
  }

  declineTransfer(txId: string): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/${txId}/decline`, {})
      .pipe(map(() => void 0));
  }

  cancelTransfer(txId: string): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/${txId}/cancel`, {})
      .pipe(map(() => void 0));
  }

  /* =====================
   * CREATE (Passcode page)
   * backend: POST /transactions/wallet-transfer
   * ===================== */

  walletTransfer(payload: any): Observable<Tx> {
    // Your backend WalletTransferRequest doesn't have fromUserId/passcode,
    // so we send only the DTO fields it expects.
    const dto = {
      recipientType: payload.recipientType,
      recipientPhone: payload.recipientPhone,
      recipientEmail: payload.recipientEmail,
      beneficiaryName: payload.beneficiaryName,
      companyName: payload.companyName,
      transferReason: payload.transferReason,
      currency: payload.currency,
      amount: payload.amount,
    };

    return this.http.post<ApiResponse<BackendTx>>(`${this.baseUrl}/wallet-transfer`, dto).pipe(
      map((res) => res.data),
      map((t) => this.mapTx(t, null)),
    );
  }

  /* =====================
   * MAPPER: backend -> UI Tx (your interface)
   * ===================== */

  private mapTx(t: BackendTx, viewerUserId: string | null): Tx {
    // Your UI Tx expects fields like: userId, from, to, countryCode...
    // We adapt backend fields to match your UI model.
    const phone = t.recipientPhone ?? '';
    const countryCode = phone.startsWith('+961') ? 'LB' : '';

    return {
      id: t.id,
      userId: viewerUserId ?? '',

      from: t.fromAccount,
      to: t.toAccount,
      countryCode,

      recipientType: t.recipientType,
      recipientPhone: t.recipientPhone ?? undefined,
      recipientEmail: t.recipientEmail ?? undefined,

      type: t.type,
      status: t.status,
      currency: t.currency,

      amount: t.amount,
      fee: t.fee,
      total: t.total,

      date: new Date(t.date),

      beneficiaryName: t.beneficiaryName ?? undefined,
      companyName: t.companyName ?? undefined,
      transferReason: t.transferReason ?? undefined,
      transferRef: t.transferRef ?? undefined,
      // ✅ if your UI Tx has extra fields, keep them optional in interface
    } as unknown as Tx;
  }
}
