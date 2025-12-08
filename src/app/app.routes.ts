// app.routes.ts
import { Routes } from '@angular/router';
import { CreateAccountComponent } from './pages/create-account/create-account';
import { VerifyEmailComponent } from './pages/verify-email/verify-email';
import { CreatePasswordComponent } from './pages/create-password/create-password';
import { MobileNumber } from './pages/mobile-number/mobile-number';
import { Transactions } from './pages/transactions/transactions';

export const routes: Routes = [
  { path: '', component: CreateAccountComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  {
    path: 'create-password',
    component: CreatePasswordComponent,
  },
  {
    path: 'mobile-number',
    component: MobileNumber,
  },
  { path: 'transactions', component: Transactions },
];
