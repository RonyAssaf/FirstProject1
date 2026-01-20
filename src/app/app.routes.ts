import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

import { CreateAccountComponent } from './pages/create-account/create-account';
import { Login } from './pages/login/login';
import { VerifyEmailComponent } from './pages/verify-email/verify-email';
import { CreatePasswordComponent } from './pages/create-password/create-password';
import { MobileNumber } from './pages/mobile-number/mobile-number';

import { Transactions } from './pages/transactions/transactions';
import { TransactionDetails } from './pages/transaction-details/transaction-details';

import { Transfers } from './pages/wallet-transfers/transfers/transfers';
import { SendWalletTransfer } from './pages/wallet-transfers/transfers/wallet-transfer-menu/send-wallet-transfer/send-wallet-transfer';
import { Summary } from './pages/wallet-transfers/transfers/wallet-transfer-menu/summary/summary';
import { Test11 } from './pages/wallet-transfers/transfers/test-1/test-11/test-11';
import { Test22 } from './pages/wallet-transfers/transfers/test-2/test-22/test-22';

import { Passcode } from './pages/passcode/passcode';
import { Successful } from './pages/successful/successful';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  // =========================
  // PUBLIC ROUTES
  // =========================
  { path: '', component: CreateAccountComponent },
  { path: 'login', component: Login },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'create-password', component: CreatePasswordComponent },
  { path: 'mobile-number', component: MobileNumber },
  { path: 'dashboard', component: Dashboard, data: { breadcrumb: 'Dashboard' } },

  // =========================
  // PROTECTED ROUTES
  // =========================
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      // -------- Transactions --------
      {
        path: 'transactions',
        data: { breadcrumb: 'Transactions' },
        children: [
          { path: '', component: Transactions },
          {
            path: ':id',
            component: TransactionDetails,
            data: {
              breadcrumb: (route: any) => `Transaction ${route.params['id']}`,
            },
          },
        ],
      },

      // -------- Transfers --------
      {
        path: 'transfers',
        component: Transfers,
        data: { breadcrumb: 'Transfers' },
        children: [
          // wallet-transfer
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
              { path: '', redirectTo: 'sendWalletTransfer', pathMatch: 'full' },
            ],
          },

          // test-1
          {
            path: 'test-1',
            data: { breadcrumb: 'Test 1' },
            children: [
              {
                path: 'test-11',
                component: Test11,
                data: { breadcrumb: 'Test 11' },
              },
              { path: '', redirectTo: 'test-11', pathMatch: 'full' },
            ],
          },

          // test-2
          {
            path: 'test-2',
            data: { breadcrumb: 'Test 2' },
            children: [
              {
                path: 'test-22',
                component: Test22,
                data: { breadcrumb: 'Test 22' },
              },
              { path: '', redirectTo: 'test-22', pathMatch: 'full' },
            ],
          },

          { path: '', redirectTo: 'wallet-transfer', pathMatch: 'full' },
        ],
      },

      { path: 'passcode', component: Passcode, data: { breadcrumb: 'Passcode' } },
      { path: 'successful', component: Successful, data: { breadcrumb: 'Success' } },
    ],
  },
];
