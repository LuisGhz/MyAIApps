import { Routes } from '@angular/router';
import { authChildGuard, authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadChildren: () => import('./features/enhance/enhance.routes').then((m) => m.ENHANCE_ROUTES),
  },
  {
    path: 'compare',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadChildren: () => import('./features/compare/compare.routes').then((m) => m.COMPARE_ROUTES),
  },
  {
    path: 'phrasal-verbs',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadChildren: () =>
      import('./features/phrasal-verbs/phrasal-verbs.routes').then((m) => m.PhrasalVerbsRoutes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
