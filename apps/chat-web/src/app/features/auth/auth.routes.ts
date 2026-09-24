import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login';
import { SuccessPage } from './pages/success/success';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'success',
    component: SuccessPage,
  },
];
