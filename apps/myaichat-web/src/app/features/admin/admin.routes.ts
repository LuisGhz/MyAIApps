import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout';
import { ModelsHomePage } from './pages/models-home-page/models-home-page';
import { ModelFormPage } from './pages/model-form-page/model-form-page';
import { UsersHomePage } from './pages/users-home-page/users-home-page';
import { adminGuard } from '@core/guards/admin-guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivateChild: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'models',
        pathMatch: 'full',
      },
      {
        path: 'models',
        component: ModelsHomePage,
        title: 'Models',
      },
      {
        path: 'models/new',
        component: ModelFormPage,
        title: 'New Model',
      },
      {
        path: 'models/:id',
        component: ModelFormPage,
        title: 'Edit Model',
      },
      {
        path: 'users',
        component: UsersHomePage,
        title: 'Users',
      },
    ],
  },
];
