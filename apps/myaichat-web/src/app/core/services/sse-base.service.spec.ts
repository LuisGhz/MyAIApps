import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { environment } from '@env/environment';
import { createTestJwt } from '@sh/testing';
import { AuthActions } from '@st/auth/auth.actions';
import { AuthStore } from '@st/auth/auth.store';
import { SseBaseService } from './sse-base.service';

@Injectable()
class TestSseBaseService extends SseBaseService {
  stream(
    formData: FormData,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
      timeout?: number;
    },
  ) {
    return this.ssePost<{ type: string; data: unknown }>('/chat/send-message', formData, options);
  }
}

describe('SseBaseService', () => {
  let service: TestSseBaseService;
  let store: Store;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [TestSseBaseService, provideStore([AuthStore])],
    });

    service = TestBed.inject(TestSseBaseService);
    store = TestBed.inject(Store);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createReader = (chunks: string[]) => {
    const encoder = new TextEncoder();
    let index = 0;

    return {
      closed: Promise.resolve(undefined),
      cancel: vi.fn().mockResolvedValue(undefined),
      read: vi.fn().mockImplementation(async () => {
        if (index >= chunks.length) {
          return { value: undefined, done: true };
        }

        return {
          value: encoder.encode(chunks[index++]),
          done: false,
        };
      }),
      releaseLock: vi.fn(),
    };
  };

  it('should stream parsed json events, include auth headers, and upload a refreshed token', async () => {
    await firstValueFrom(
      store.dispatch(new AuthActions.Login({ token: createTestJwt({ role: 'user' }) })),
    );

    const reader = createReader([
      '{"type":"delta","data":"Hello"}\n',
      '{"type":"done","data":{"chatId":"chat-1"}}\n',
    ]);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'x-new-access-token': 'new-token' }),
      body: {
        getReader: () => reader,
      } as unknown as ReadableStream<Uint8Array>,
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const events = await new Promise<Array<{ type: string; data: unknown }>>((resolve, reject) => {
      const received: Array<{ type: string; data: unknown }> = [];

      service
        .stream(new FormData(), {
          headers: { 'x-trace-id': 'trace-1' },
          params: { page: 1, include: ['messages', 'metadata'] },
        })
        .subscribe({
          next: (event) => received.push(event),
          error: reject,
          complete: () => resolve(received),
        });
    });

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = options.headers as Headers;

    expect(url).toBe(
      `${environment.apiUrl}/chat/send-message?page=1&include=messages&include=metadata`,
    );
    expect(headers.get('Authorization')).toMatch(/^Bearer /);
    expect(headers.get('x-trace-id')).toBe('trace-1');
    expect(options.credentials).toBe('include');
    expect(events).toEqual([
      { type: 'delta', data: 'Hello' },
      { type: 'done', data: { chatId: 'chat-1' } },
    ]);
    expect(store.selectSnapshot(AuthStore.token)).toBe('new-token');
  });

  it('should logout and emit an error when the response is unauthorized', async () => {
    await firstValueFrom(
      store.dispatch(new AuthActions.Login({ token: createTestJwt({ role: 'admin' }) })),
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      body: null,
    } as Response);
    vi.stubGlobal('fetch', fetchMock);

    const error = await new Promise<Error>((resolve) => {
      service.stream(new FormData()).subscribe({
        error: (streamError) => resolve(streamError as Error),
      });
    });

    expect(error.message).toBe('SSE request failed with status 401');
    expect(store.selectSnapshot(AuthStore.isAuthenticated)).toBe(false);
    expect(store.selectSnapshot(AuthStore.token)).toBeNull();
  });

  it('should abort the request when the subscription is disposed', () => {
    let signal: AbortSignal | undefined;
    const fetchMock = vi.fn().mockImplementation(async (_url: string, options?: RequestInit) => {
      signal = options?.signal as AbortSignal;
      return new Promise(() => undefined);
    });
    vi.stubGlobal('fetch', fetchMock);

    const subscription = service.stream(new FormData()).subscribe();

    expect(signal?.aborted).toBe(false);

    subscription.unsubscribe();

    expect(signal?.aborted).toBe(true);
  });
});
