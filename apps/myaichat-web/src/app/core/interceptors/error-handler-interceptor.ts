import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, throwError } from 'rxjs';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(NzMessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage = error.error?.message || 'An error occurred';
      messageService.error(errorMessage);
      return throwError(() => error);
    }),
  );
};
