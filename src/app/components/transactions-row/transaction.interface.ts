export interface Tx {
  id: number;
  date: Date;
  userId: number;
  from: string;
  to: string;
  type: string;
  status: 'Completed' | 'Pending' | 'Failed';
  currency: string;
  total: number;
  amount: number;
  fee: number;
  countryCode: string;
}
