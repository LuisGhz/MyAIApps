import { Routes } from '@angular/router';

export const PhrasalVerbsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/explain-phrasal-verb-page/explain-phrasal-verb-page').then(
        (m) => m.ExplainPhrasalVerbPage,
      ),
  },
];
