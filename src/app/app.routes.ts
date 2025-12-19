import { Routes } from '@angular/router';
import { CreateAccountComponent } from './pages/create-account/create-account';
import { VerifyEmailComponent } from './pages/verify-email/verify-email';
import { CreatePasswordComponent } from './pages/create-password/create-password';
import { MobileNumber } from './pages/mobile-number/mobile-number';
import { Transactions } from './pages/transactions/transactions';
import { TransactionDetails } from './pages/transaction-details/transaction-details';

export const routes: Routes = [
  // 🔹 Onboarding (NO breadcrumbs)
  { path: '', component: CreateAccountComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'create-password', component: CreatePasswordComponent },
  { path: 'mobile-number', component: MobileNumber },

  // 🔹 App area (breadcrumbs start here)
  {
    path: 'transactions',
    data: { breadcrumb: 'Transactions' },
    children: [
      {
        path: '',
        component: Transactions,
      },
      {
        path: ':id',
        component: TransactionDetails,
        data: {
          breadcrumb: (route: any) => `Transaction ${route.params['id']}`,
        },
      },
    ],
  },
];
