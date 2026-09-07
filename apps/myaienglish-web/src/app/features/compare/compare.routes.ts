import { Routes } from '@angular/router';

export const COMPARE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/compare-page/compare-page').then((m) => m.ComparePage),
  },
];
