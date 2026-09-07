import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'prompts',
    canActivate: [authGuard],
    loadChildren: () => import('./features/prompts/prompts.routes').then((m) => m.PROMPTS_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES),
  },
];
