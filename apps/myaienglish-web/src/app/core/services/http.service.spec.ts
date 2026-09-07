import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '@env/environment';
import { HttpService } from './http.service';

interface SampleResponse {
  ok: boolean;
}

@Injectable()
class TestHttpService extends HttpService {
  requestGet() {
    return this.get<SampleResponse>('/sample', {
      params: { include: 'details' },
    });
  }

  requestPostPromise(body: { value: string }) {
    return this.postP<SampleResponse, { value: string }>('/sample', body);
  }
}

describe('HttpService', () => {
  let httpController: HttpTestingController;
  let service: TestHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestHttpService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TestHttpService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
    TestBed.resetTestingModule();
  });

  it('should prefix observable requests with the configured api url', async () => {
    const responsePromise = firstValueFrom(service.requestGet());

    const request = httpController.expectOne(
      (pendingRequest) => pendingRequest.url === `${environment.apiUrl}/sample`,
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('include')).toBe('details');

    request.flush({ ok: true });

    await expect(responsePromise).resolves.toEqual({ ok: true });
  });

  it('should resolve promise-based post requests with the response body', async () => {
    const requestPromise = service.requestPostPromise({ value: 'payload' });

    const request = httpController.expectOne(`${environment.apiUrl}/sample`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ value: 'payload' });

    request.flush({ ok: true });

    await expect(requestPromise).resolves.toEqual({ ok: true });
  });
});
