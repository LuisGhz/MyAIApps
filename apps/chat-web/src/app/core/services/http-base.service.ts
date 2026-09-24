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
};

@Injectable({
  providedIn: 'root',
})
export class HttpBaseService {
  protected get<T>(path: string, options?: HttpClientOptions) {
    return this.#http.get<T>(`${this.#apiUrl}${path}`, options);
  }

  protected getP<T>(path: string, options?: HttpClientOptions) {
    return firstValueFrom(this.#http.get<T>(`${this.#apiUrl}${path}`, options));
  }

  protected post<T>(path: string, body: any, options?: HttpClientOptions) {
    return this.#http.post<T>(`${this.#apiUrl}${path}`, body, options);
  }

  protected postP<T, B>(path: string, body: B, options?: HttpClientOptions) {
    return firstValueFrom(this.#http.post<T>(`${this.#apiUrl}${path}`, body, options));
  }

  protected patch<T, B>(path: string, body: B, options?: HttpClientOptions) {
    return this.#http.patch<T>(`${this.#apiUrl}${path}`, body, options);
  }

  protected patchP<T, B>(path: string, body: B, options?: HttpClientOptions) {
    return firstValueFrom(this.#http.patch<T>(`${this.#apiUrl}${path}`, body, options));
  }

  protected delete<T>(path: string, options?: HttpClientOptions) {
    return this.#http.delete<T>(`${this.#apiUrl}${path}`, options);
  }

  protected deleteP<T>(path: string, options?: HttpClientOptions) {
    return firstValueFrom(this.#http.delete<T>(`${this.#apiUrl}${path}`, options));
  }

  #http = inject(HttpClient);
  #apiUrl = environment.apiUrl;
}
