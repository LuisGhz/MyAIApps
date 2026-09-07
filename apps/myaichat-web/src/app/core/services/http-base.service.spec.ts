import { HttpClient, HttpHeaders } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { environment } from '@env/environment';
import { HttpBaseService } from './http-base.service';

@Injectable()
class TestHttpBaseService extends HttpBaseService {
  read(options?: { headers?: HttpHeaders }) {
    return this.get<{ value: string }>('/items', options);
  }

  readPromise() {
    return this.getP<{ value: string }>('/items');
  }

  create(body: { value: string }) {
    return this.post<{ id: string }>('/items', body);
  }

  createPromise(body: { value: string }) {
    return this.postP<{ id: string }, { value: string }>('/items', body);
  }

  update(body: { value: string }) {
    return this.patch<{ value: string }, { value: string }>('/items/1', body);
  }

  updatePromise(body: { value: string }) {
    return this.patchP<{ value: string }, { value: string }>('/items/1', body);
  }

  remove() {
    return this.delete<void>('/items/1');
  }

  removePromise() {
    return this.deleteP<void>('/items/1');
  }
}

describe('HttpBaseService', () => {
  let service: TestHttpBaseService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [TestHttpBaseService, HttpClient, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TestHttpBaseService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should prefix get and getP requests with the api url', async () => {
    const observablePromise = firstValueFrom(
      service.read({ headers: new HttpHeaders({ 'x-trace-id': 'trace-1' }) }),
    );
    const promiseRequest = service.readPromise();

    const requests = httpTestingController.match(`${environment.apiUrl}/items`);

    expect(requests).toHaveLength(2);
    expect(requests[0].request.method).toBe('GET');
    expect(requests[0].request.headers.get('x-trace-id')).toBe('trace-1');
    expect(requests[1].request.method).toBe('GET');

    requests[0].flush({ value: 'from observable' });
    requests[1].flush({ value: 'from promise' });

    await expect(observablePromise).resolves.toEqual({ value: 'from observable' });
    await expect(promiseRequest).resolves.toEqual({ value: 'from promise' });
  });

  it('should prefix post and postP requests with the api url', async () => {
    const payload = { value: 'created item' };
    const observablePromise = firstValueFrom(service.create(payload));
    const promiseRequest = service.createPromise(payload);

    const requests = httpTestingController.match(`${environment.apiUrl}/items`);

    expect(requests).toHaveLength(2);
    expect(requests[0].request.method).toBe('POST');
    expect(requests[0].request.body).toEqual(payload);
    expect(requests[1].request.method).toBe('POST');
    expect(requests[1].request.body).toEqual(payload);

    requests[0].flush({ id: 'created-1' });
    requests[1].flush({ id: 'created-2' });

    await expect(observablePromise).resolves.toEqual({ id: 'created-1' });
    await expect(promiseRequest).resolves.toEqual({ id: 'created-2' });
  });

  it('should prefix patch and patchP requests with the api url', async () => {
    const payload = { value: 'updated item' };
    const observablePromise = firstValueFrom(service.update(payload));
    const promiseRequest = service.updatePromise(payload);

    const requests = httpTestingController.match(`${environment.apiUrl}/items/1`);

    expect(requests).toHaveLength(2);
    expect(requests[0].request.method).toBe('PATCH');
    expect(requests[0].request.body).toEqual(payload);
    expect(requests[1].request.method).toBe('PATCH');
    expect(requests[1].request.body).toEqual(payload);

    requests[0].flush({ value: 'patched from observable' });
    requests[1].flush({ value: 'patched from promise' });

    await expect(observablePromise).resolves.toEqual({ value: 'patched from observable' });
    await expect(promiseRequest).resolves.toEqual({ value: 'patched from promise' });
  });

  it('should prefix delete and deleteP requests with the api url', async () => {
    const observablePromise = firstValueFrom(service.remove());
    const promiseRequest = service.removePromise();

    const requests = httpTestingController.match(`${environment.apiUrl}/items/1`);

    expect(requests).toHaveLength(2);
    expect(requests[0].request.method).toBe('DELETE');
    expect(requests[1].request.method).toBe('DELETE');

    requests[0].flush(null);
    requests[1].flush(null);

    await expect(observablePromise).resolves.toBeNull();
    await expect(promiseRequest).resolves.toBeNull();
  });
});
