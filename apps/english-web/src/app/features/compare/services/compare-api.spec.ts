import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '@env/environment';
import { CompareResModel } from '../models';
import { CompareApi } from './compare-api';

describe('CompareApi', () => {
  let compareApi: CompareApi;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompareApi, provideHttpClient(), provideHttpClientTesting()],
    });

    compareApi = TestBed.inject(CompareApi);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
    TestBed.resetTestingModule();
  });

  it('should post the compare payload and resolve the response', async () => {
    const response: CompareResModel = {
      inputs: [
        { explanation: 'This is concise and direct.', input: 'See you soon.' },
        { explanation: 'This is warmer and slightly softer.', input: 'I hope to see you soon.' },
      ],
      summary: 'Use the second option when you want a warmer tone.',
    };
    const requestPromise = compareApi.compare(
      ['See you soon.', 'I hope to see you soon.'],
      'I am writing to a coworker',
    );

    const request = httpController.expectOne(`${environment.apiUrl}/compare`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      context: 'I am writing to a coworker',
      inputs: ['See you soon.', 'I hope to see you soon.'],
    });

    request.flush(response);

    await expect(requestPromise).resolves.toEqual(response);
  });
});
