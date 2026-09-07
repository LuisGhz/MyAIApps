import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '@env/environment';
import { DeveloperModel } from '../models';
import { DevelopersApi } from './developers-api';

describe('DevelopersApi', () => {
  let service: DevelopersApi;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [DevelopersApi, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DevelopersApi);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should fetch all developers', async () => {
    const developers: DeveloperModel[] = [
      {
        id: 'dev-1',
        name: 'OpenAI',
        link: 'https://platform.openai.com',
        imageUrl: 'https://example.com/openai.png',
      },
    ];

    const developersPromise = service.fetchAll();
    const request = httpTestingController.expectOne(`${environment.apiUrl}/models/developers`);

    expect(request.request.method).toBe('GET');

    request.flush(developers);

    await expect(developersPromise).resolves.toEqual(developers);
  });
});
