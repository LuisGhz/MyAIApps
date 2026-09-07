import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NzMessageService } from 'ng-zorro-antd/message';
import { errorHandlerInterceptor } from './error-handler-interceptor';

describe('errorHandlerInterceptor', () => {
  let httpClient: HttpClient;
  let httpController: HttpTestingController;
  let nzMessageService: Pick<NzMessageService, 'error'>;

  beforeEach(() => {
    nzMessageService = {
      error: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorHandlerInterceptor])),
        provideHttpClientTesting(),
        { provide: NzMessageService, useValue: nzMessageService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('should show each backend error message from an array payload and rethrow the http error', async () => {
    const responsePromise = firstValueFrom(httpClient.get('/sample'));

    const request = httpController.expectOne('/sample');
    request.flush(
      { error: 'Bad Request', message: ['First issue', 'Second issue'], statusCode: 400 },
      { status: 400, statusText: 'Bad Request' },
    );

    await expect(responsePromise).rejects.toBeInstanceOf(HttpErrorResponse);
    expect(nzMessageService.error).toHaveBeenNthCalledWith(1, 'First issue');
    expect(nzMessageService.error).toHaveBeenNthCalledWith(2, 'Second issue');
  });

  it('should show a generic fallback when the backend response has no message payload', async () => {
    const responsePromise = firstValueFrom(httpClient.get('/sample'));

    const request = httpController.expectOne('/sample');
    request.flush({}, { status: 500, statusText: 'Server Error' });

    await expect(responsePromise).rejects.toBeInstanceOf(HttpErrorResponse);
    expect(nzMessageService.error).toHaveBeenCalledWith('An unexpected error occurred');
  });
});
