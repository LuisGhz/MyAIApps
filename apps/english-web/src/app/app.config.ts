import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { MERMAID_OPTIONS, provideMarkdown } from 'ngx-markdown';
import { provideServiceWorker } from '@angular/service-worker';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { withNgxsStoragePlugin, StorageEngine, STORAGE_ENGINE } from '@ngxs/storage-plugin';
import { provideStore } from '@ngxs/store';
import { AppStore } from '@st/app/app.store';
import { errorHandlerInterceptor } from '@core/interceptors';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { environment } from '../environments/environment';

import { provideNzIcons } from 'ng-zorro-antd/icon';
import { LogoutOutline } from '@ant-design/icons-angular/icons';
registerLocaleData(en);

class SuffixStorageEngine implements StorageEngine {
  #prefix = 'myaienglish__';

  getItem(key: string) {
    const raw = localStorage.getItem(this.#prefix + key);
    return raw ? JSON.parse(raw) : null;
  }

  setItem(key: string, value: any) {
    localStorage.setItem(this.#prefix + key, JSON.stringify(value));
  }

  removeItem(key: string) {
    localStorage.removeItem(this.#prefix + key);
  }

  clear() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(this.#prefix)) {
        localStorage.removeItem(k);
      }
    }
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideNzI18n(en_US),
    provideNzIcons([LogoutOutline]),
    provideAnimationsAsync(),
    provideAuth0({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: environment.auth0.authorizationParams,
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
      httpInterceptor: {
        allowedList: [`${environment.apiUrl}/*`],
      },
    }),
    provideHttpClient(withInterceptors([errorHandlerInterceptor, authHttpInterceptorFn])),
    provideMarkdown({
      loader: HttpClient,
      mermaidOptions: {
        provide: MERMAID_OPTIONS,
        useValue: {
          darkMode: true,
          look: 'handDrawn',
        },
      },
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideStore(
      [AppStore],
      withNgxsReduxDevtoolsPlugin(),
      withNgxsFormPlugin(),
      withNgxsStoragePlugin({
        keys: ['app'],
      }),
    ),
    {
      provide: STORAGE_ENGINE,
      useClass: SuffixStorageEngine,
    },
  ],
};
