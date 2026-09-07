import { Routes } from '@angular/router';

export const ENHANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'enhance',
    loadComponent: () =>
      import('./pages/enhance-page/enhance-page').then((m) => m.EnhancePage),
  },
];
