import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthStore } from '@st/auth/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  const isAuthenticated = store.selectSnapshot(AuthStore.isAuthenticated);

  if (!isAuthenticated) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};
