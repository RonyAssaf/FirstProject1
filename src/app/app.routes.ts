import { Routes } from '@angular/router';

import { CreateAccountComponent } from './pages/create-account/create-account';
import { VerifyEmailComponent } from './pages/verify-email/verify-email';
import { CreatePasswordComponent } from './pages/create-password/create-password';
import { MobileNumber } from './pages/mobile-number/mobile-number';

import { Transactions } from './pages/transactions/transactions';
import { TransactionDetails } from './pages/transaction-details/transaction-details';

import { Transfers } from './pages/wallet-transfers/transfers/transfers';

import { SendWalletTransfer } from './pages/wallet-transfers/transfers/wallet-transfer-menu/send-wallet-transfer/send-wallet-transfer';
import { Test11 } from './pages/wallet-transfers/transfers/test-1/test-11/test-11';
import { Test22 } from './pages/wallet-transfers/transfers/test-2/test-22/test-22';
import { Summary } from './pages/wallet-transfers/transfers/wallet-transfer-menu/summary/summary';
import { Passcode } from './pages/passcode/passcode';
import { Successful } from './pages/successful/successful';

export const routes: Routes = [
  { path: '', component: CreateAccountComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'create-password', component: CreatePasswordComponent },
  { path: 'mobile-number', component: MobileNumber },
  { path: 'passcode', component: Passcode },
  { path: 'successful', component: Successful },

  {
    path: 'transactions',
    data: { breadcrumb: 'Transactions' },
    children: [
      { path: '', component: Transactions },
      {
        path: ':id',
        component: TransactionDetails,
        data: { breadcrumb: (route: any) => `Transaction-details ${route.params['id']}` },
      },
    ],
  },

  {
    path: 'transfers',
    component: Transfers,
    data: { breadcrumb: 'Transfers' },
    children: [
      {
        path: 'wallet-transfer',
        data: { breadcrumb: 'Wallet Transfer' },
        children: [
          {
            path: 'sendWalletTransfer',
            component: SendWalletTransfer,
            data: { breadcrumb: 'Send Wallet Transfer' },
          },
          {
            path: 'summary',
            component: Summary,
            data: { breadcrumb: 'Summary' },
          },
          { path: '', pathMatch: 'full', redirectTo: 'sendWalletTransfer' },
        ],
      },

      {
        path: 'test-1',
        data: { breadcrumb: 'test1' },
        children: [
          { path: 'test-11', component: Test11, data: { breadcrumb: 'test11' } },
          { path: '', pathMatch: 'full', redirectTo: 'test-11' },
        ],
      },

      {
        path: 'test-2',
        data: { breadcrumb: 'test2' },
        children: [
          { path: 'test-22', component: Test22, data: { breadcrumb: 'test22' } },
          { path: '', pathMatch: 'full', redirectTo: 'test-22' },
        ],
      },

      { path: '', pathMatch: 'full', redirectTo: 'wallet-transfer' },
    ],
  },
];
