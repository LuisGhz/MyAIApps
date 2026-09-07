import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { firstValueFrom } from 'rxjs';

type HttpClientOptions = {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  params?:
    | HttpParams
    | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  reportProgress?: boolean;
  withCredentials?: boolean;
  credentials?: RequestCredentials;
  priority?: RequestPriority;
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
export class HttpService {
  #http = inject(HttpClient);
  #api = environment.apiUrl;

  protected get<R>(path: string, options?: HttpClientOptions) {
    return this.#http.get<R>(this.#api + path, options);
  }

  protected getP<R>(path: string, options?: HttpClientOptions) {
    return firstValueFrom(this.#http.get<R>(this.#api + path, options));
  }

  protected post<R, B>(path: string, body: B, options?: HttpClientOptions) {
    return this.#http.post<R>(this.#api + path, body, options);
  }

  protected postP<R, B>(path: string, body: B, options?: HttpClientOptions) {
    return firstValueFrom(this.#http.post<R>(this.#api + path, body, options));
  }

  protected put<R, B>(path: string, body: B, options?: HttpClientOptions) {
    return this.#http.put<R>(this.#api + path, body, options);
  }

  protected putP<R, B>(path: string, body: B, options?: HttpClientOptions) {
    return firstValueFrom(this.#http.put<R>(this.#api + path, body, options));
  }

  protected delete<R>(path: string, options?: HttpClientOptions) {
    return this.#http.delete<R>(this.#api + path, options);
  }

  protected deleteP<R>(path: string, options?: HttpClientOptions) {
    return firstValueFrom(this.#http.delete<R>(this.#api + path, options));
  }
}
