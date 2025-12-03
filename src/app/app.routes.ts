// app.routes.ts
import { Routes } from '@angular/router';
import { CreateAccountComponent } from './pages/create-account/create-account';
import { VerifyEmailComponent } from './pages/verify-email/verify-email';

export const routes: Routes = [
  { path: '', component: CreateAccountComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  {
    path: 'create-password',
    loadComponent: () =>
      import('./pages/create-password/create-password').then((m) => m.CreatePasswordComponent),
  },
];
