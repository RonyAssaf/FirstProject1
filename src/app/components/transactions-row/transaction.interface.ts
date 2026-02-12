export interface Tx {
  id: string;
  date: Date;
  userId: number;
  from: string;
  to: string;
  type: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  currency: string;
  total: number;
  amount: number;
  fee: number;
  countryCode: string;
}
