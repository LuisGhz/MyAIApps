import { authGuardFn } from '@auth0/auth0-angular';
import { CanActivateChildFn, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = authGuardFn;
export const authChildGuard: CanActivateChildFn = authGuardFn;
