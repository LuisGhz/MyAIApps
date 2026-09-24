import { CanActivateChildFn } from '@angular/router';
import { select } from '@ngxs/store';
import { AuthStore } from '@st/auth/auth.store';

export const adminGuard: CanActivateChildFn = (childRoute, state) => {
  const isAuthenticated = select(AuthStore.isAuthenticated);
  const isAdmin = select(AuthStore.isAdmin);
  return isAuthenticated() && isAdmin();
};
