import { Component, DestroyRef, inject, signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeveloperModel } from '../models';
import { ModelFormService } from './model-form.service';

@Component({
  template: '',
})
class TestHost {
  readonly service = inject(ModelFormService);
  readonly destroyRef = inject(DestroyRef);
  readonly developers = signal<DeveloperModel[]>([
    {
      id: 'dev-1',
      name: 'OpenAI',
      link: 'https://platform.openai.com',
      imageUrl: 'https://example.com/openai.png',
    },
    {
      id: 'dev-2',
      name: 'Anthropic',
      link: 'https://www.anthropic.com',
      imageUrl: 'https://example.com/anthropic.png',
    },
  ]);
  readonly developerName = signal('');
  readonly form = this.service.createForm();
}

describe('ModelFormService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHost = async () => {
    const result = await render(TestHost, {
      providers: [ModelFormService],
    });

    return result.fixture.componentInstance;
  };

  it('should create a form with the expected controls and validators', async () => {
    const host = await renderHost();

    expect(host.form.controls.guestAccess.value).toBe(false);
    expect(host.form.controls.supportsTemperature.value).toBe(false);
    expect(host.form.controls.isReasoning.value).toBe(false);
    expect(host.form.controls.reasoningLevel.value).toBeNull();
    expect(host.form.controls.name.hasError('required')).toBe(true);

    host.form.controls.name.setValue('a'.repeat(101));
    host.form.controls.shortName.setValue('b'.repeat(21));
    host.form.controls.value.setValue('c'.repeat(101));
    host.form.controls.metadata.controls.contextWindow.setValue(0);
    host.form.controls.metadata.controls.maxOutputTokens.setValue(0);

    expect(host.form.controls.name.hasError('maxlength')).toBe(true);
    expect(host.form.controls.shortName.hasError('maxlength')).toBe(true);
    expect(host.form.controls.value.hasError('maxlength')).toBe(true);
    expect(host.form.controls.metadata.controls.contextWindow.hasError('min')).toBe(true);
    expect(host.form.controls.metadata.controls.maxOutputTokens.hasError('min')).toBe(true);
    expect(host.form.controls.developerId.hasError('required')).toBe(true);
  });

  it('should update the developer name when the selected developer changes', async () => {
    const host = await renderHost();

    host.service.handleDeveloperChange(
      host.form,
      host.developers,
      host.developerName,
      host.destroyRef,
    );

    host.form.controls.developerId.setValue('dev-2');
    expect(host.developerName()).toBe('Anthropic');

    host.form.controls.developerId.setValue('unknown');
    expect(host.developerName()).toBe('');
  });

  it('should enable and disable the reasoning level control based on reasoning mode', async () => {
    const host = await renderHost();
    const reasoningLevelControl = host.form.controls.reasoningLevel;

    host.service.handleReasoningLevelControl(host.form, host.destroyRef);

    host.form.controls.isReasoning.setValue(true);

    expect(reasoningLevelControl.disabled).toBe(false);
    expect(reasoningLevelControl.hasError('required')).toBe(true);

    reasoningLevelControl.setValue('medium');
    expect(reasoningLevelControl.valid).toBe(true);

    host.form.controls.isReasoning.setValue(false);

    expect(reasoningLevelControl.disabled).toBe(true);
    expect(reasoningLevelControl.value).toBeNull();
    expect(reasoningLevelControl.errors).toBeNull();
  });
});
