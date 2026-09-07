import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { dispatch, select } from '@ngxs/store';
import { AuthActions } from '@st/auth/auth.actions';
import { AuthStore } from '@st/auth/auth.store';

type SseOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  integrity?: string;
  timeout?: number;
};

@Injectable({
  providedIn: 'root',
})
export class SseBaseService {
  protected ssePost<R>(path: string, formData: FormData, options?: SseOptions): Observable<R> {
    return new Observable((observer) => {
      const controller = new AbortController();
      const timeoutId = this.#applyTimeout(options?.timeout, controller);
      const url = this.#buildUrl(path, options?.params);
      const headers = this.#createHeaders(options?.headers);
      this.#appendAuthHeader(headers);

      const fetchOptions: RequestInit = {
        method: 'POST',
        body: formData,
        headers,
        cache: options?.cache,
        mode: options?.mode,
        redirect: options?.redirect,
        referrer: options?.referrer,
        integrity: options?.integrity,
        credentials: options?.credentials ?? 'include',
        signal: controller.signal,
      };

      fetch(url, fetchOptions)
        .then((response) => {
          this.#handleAuthSideEffects(response);

          if (!response.ok) {
            throw new Error(`SSE request failed with status ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            observer.complete();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          const streamChunks = (): Promise<void> =>
            reader.read().then(({ value, done }) => {
              if (done) {
                buffer += decoder.decode();
                this.#emitBufferedLines(buffer, observer);
                observer.complete();
                return;
              }

              if (value) {
                buffer += decoder.decode(value, { stream: true });
              }

              buffer = this.#emitBufferedLines(buffer, observer);
              return streamChunks();
            });

          return streamChunks();
        })
        .catch((error) => {
          if ((error as DOMException)?.name === 'AbortError') {
            return;
          }
          observer.error(error);
        });

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        controller.abort();
      };
    });
  }

  #apiUrl = environment.apiUrl;
  #token = select(AuthStore.token);
  #uploadToken = dispatch(AuthActions.UploadToken);
  #logout = dispatch(AuthActions.Logout);

  #emitBufferedLines<R>(buffer: string, observer: { next: (value: R) => void }): string {
    const lines = buffer.split('\n');
    const pending = lines.pop() ?? '';

    lines
      .map((line) => line.trim())
      .filter((line) => line.length)
      .forEach((line) => {
        try {
          observer.next(JSON.parse(line));
        } catch (error) {
          console.error('Failed to parse SSE event:', error, 'Line:', line);
        }
      });

    return pending;
  }

  #buildUrl(path: string, params?: SseOptions['params']): string {
    let url = `${this.#apiUrl}${path}`;

    if (!params) {
      return url;
    }

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      const normalized = Array.isArray(value) ? value : [value];
      normalized.forEach((item) => query.append(key, String(item)));
    });

    const queryString = query.toString();
    if (!queryString) {
      return url;
    }

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${queryString}`;
  }

  #createHeaders(headers?: Record<string, string>): Headers {
    const normalized = new Headers();

    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        normalized.set(key, value);
      });
    }

    return normalized;
  }

  #appendAuthHeader(headers: Headers): void {
    const token = this.#token?.();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  #handleAuthSideEffects(response: Response): void {
    if (response.status === 401) {
      this.#logout();
      return;
    }

    const newToken = response.headers.get('x-new-access-token');
    if (newToken) {
      this.#uploadToken({ token: newToken });
    }
  }

  #applyTimeout(timeout: number | undefined, controller: AbortController): number | undefined {
    if (!timeout) {
      return undefined;
    }
    return window.setTimeout(() => controller.abort(), timeout);
  }
}
