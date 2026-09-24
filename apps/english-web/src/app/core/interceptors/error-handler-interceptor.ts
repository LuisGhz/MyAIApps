import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, throwError } from 'rxjs';

interface ErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

function getErrorMessages(error: unknown): string[] {
  const source = error instanceof HttpErrorResponse ? error.error : error;

  if (source && typeof source === 'object' && 'message' in source) {
    const { message } = source as Partial<ErrorResponse>;

    if (Array.isArray(message)) {
      return message;
    }

    if (typeof message === 'string' && message.length > 0) {
      return [message];
    }
  }

  return ['An unexpected error occurred'];
}

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const nzService = inject(NzMessageService);
  return next(req).pipe(
    catchError((error: unknown) => {
      getErrorMessages(error).forEach((message) => nzService.error(message));

      return throwError(() => error);
    }),
  );
};
