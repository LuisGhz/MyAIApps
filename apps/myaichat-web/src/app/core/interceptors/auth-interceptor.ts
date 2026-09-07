import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { dispatch, select } from '@ngxs/store';
import { AuthActions } from '@st/auth/auth.actions';
import { AuthStore } from '@st/auth/auth.store';
import { tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = select(AuthStore.token);
  const uploadToken = dispatch(AuthActions.UploadToken);
  const logout = dispatch(AuthActions.Logout);
  const router = inject(Router);
  const currentToken = token();

  if (currentToken) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentToken}`,
      },
      withCredentials: true,
    });
    req = clonedReq;
  }

  return next(req).pipe(
    tap({
      next: (response) => {
        if (response instanceof HttpResponse) {
          const newToken = response.headers.get('x-new-access-token');
          if (newToken) {
            uploadToken({ token: newToken });
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log('Interceptor error:', error);
        if (error.status === 401) {
          logout();
          router.navigate(['/auth/login']);
        }
      },
    }),
  );
};
