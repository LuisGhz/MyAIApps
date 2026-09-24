import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

import {
  createMockActivatedRoute,
  createMockNzMessageService,
  createMockRouter,
} from '@sh/testing';

import { ModelFormPage } from './model-form-page';
import { DevelopersApi, ModelFormService, ModelsApi } from '../../services';
import { DeveloperModel, ModelResModel } from '../../models';

type NzMessageServiceMock = ReturnType<typeof createMockNzMessageService>;

const defaultDevelopers: DeveloperModel[] = [
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
];

const defaultModel: ModelResModel = {
  id: 'model-1',
  name: 'GPT-4 Turbo',
  shortName: 'GPT-4T',
  value: 'gpt-4-turbo',
  link: 'https://platform.openai.com/docs',
  guestAccess: false,
  price: { input: 0.0001, output: 0.0003 },
  supportsTemperature: true,
  isReasoning: true,
  reasoningLevel: 'medium',
  metadata: {
    contextWindow: 128000,
    maxOutputTokens: 4096,
    knowledgeCutoff: 'April 2023',
  },
  developer: {
    id: 'dev-1',
    name: 'OpenAI',
    link: 'https://platform.openai.com',
    imageUrl: 'https://example.com/openai.png',
  },
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-02T10:00:00Z'),
};

const createModelFormGroup = () =>
  new FormGroup({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(MODEL_NAME_MAX_LENGTH)],
    }),
    shortName: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(MODEL_SHORT_NAME_MAX_LENGTH)],
    }),
    value: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(MODEL_VALUE_MAX_LENGTH)],
    }),
    link: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    guestAccess: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
    price: new FormGroup({
      input: new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(PRICE_MIN_VALUE)],
      }),
      output: new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(PRICE_MIN_VALUE)],
      }),
    }),
    supportsTemperature: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
    isReasoning: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
    reasoningLevel: new FormControl<string | null>(null),
    metadata: new FormGroup({
      contextWindow: new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(TOKENS_MIN_VALUE)],
      }),
      maxOutputTokens: new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(TOKENS_MIN_VALUE)],
      }),
      knowledgeCutoff: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    }),
    developerId: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
  });

const createModelsApiMock = (overrides?: Partial<ModelsApi>) => ({
  create: vi.fn().mockResolvedValue(defaultModel),
  update: vi.fn().mockResolvedValue(defaultModel),
  getById: vi.fn().mockResolvedValue(defaultModel),
  ...overrides,
});

const createDevelopersApiMock = (overrides?: Partial<DevelopersApi>) => ({
  fetchAll: vi.fn().mockResolvedValue(defaultDevelopers),
  ...overrides,
});

const createModelFormServiceMock = (overrides?: Partial<ModelFormService>) => ({
  createForm: vi.fn().mockReturnValue(createModelFormGroup()),
  handleDeveloperChange: vi.fn(),
  handleReasoningLevelControl: vi.fn(),
  ...overrides,
});

interface RenderOptions {
  modelId?: string | null;
  modelsApiOverrides?: Partial<ModelsApi>;
  developersApiOverrides?: Partial<DevelopersApi>;
  modelFormOverrides?: Partial<ModelFormService>;
  routerOverrides?: Partial<Router>;
  routeOverrides?: Parameters<typeof createMockActivatedRoute>[0];
  messageOverrides?: Partial<NzMessageServiceMock>;
}

describe('ModelFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = async (options: RenderOptions = {}) => {
    const modelsApi = createModelsApiMock(options.modelsApiOverrides);
    const developersApi = createDevelopersApiMock(options.developersApiOverrides);
    const modelFormService = createModelFormServiceMock(options.modelFormOverrides);
    const router = createMockRouter(options.routerOverrides);
    const route = createMockActivatedRoute({
      params: options.modelId ? { id: options.modelId } : {},
      ...options.routeOverrides,
    });
    const messageService = createMockNzMessageService(options.messageOverrides);

    const renderResult = await render(ModelFormPage, {
      providers: [
        { provide: ModelsApi, useValue: modelsApi },
        { provide: DevelopersApi, useValue: developersApi },
        { provide: ModelFormService, useValue: modelFormService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: NzMessageService, useValue: messageService },
      ],
    });

    return {
      ...renderResult,
      modelsApi,
      developersApi,
      modelFormService,
      router,
      messageService,
    };
  };

  const fillRequiredFields = async (user: ReturnType<typeof userEvent.setup>, form: FormGroup) => {
    await user.type(screen.getByPlaceholderText('GPT-4 Turbo'), 'GPT-4 Turbo');
    await user.type(screen.getByPlaceholderText('GPT-4T'), 'GPT-4T');
    await user.type(screen.getByPlaceholderText('gpt-4-turbo'), 'gpt-4-turbo');
    await user.type(
      screen.getByPlaceholderText('https://platform.openai.com/docs'),
      'https://platform.openai.com/docs',
    );

    form.patchValue({
      guestAccess: true,
      price: { input: 0.0001, output: 0.0003 },
      supportsTemperature: true,
      isReasoning: true,
      reasoningLevel: 'medium',
      metadata: {
        contextWindow: 128000,
        maxOutputTokens: 4096,
        knowledgeCutoff: 'April 2023',
      },
      developerId: 'dev-1',
    });
  };

  it('should create model when submitting the form', async () => {
    const user = userEvent.setup();
    const { fixture, modelsApi, messageService, router } = await renderComponent();
    const submitButton = screen.getByRole('button', { name: /create model/i });

    expect(submitButton).toBeInTheDocument();

    await fillRequiredFields(user, fixture.componentInstance.form);
    await user.click(submitButton);

    await waitFor(() => {
      expect(modelsApi.create).toHaveBeenCalledWith({
        name: 'GPT-4 Turbo',
        shortName: 'GPT-4T',
        value: 'gpt-4-turbo',
        link: 'https://platform.openai.com/docs',
        price: { input: 0.0001, output: 0.0003 },
        supportsTemperature: true,
        isReasoning: true,
        reasoningLevel: 'medium',
        guestAccess: true,
        metadata: {
          contextWindow: 128000,
          maxOutputTokens: 4096,
          knowledgeCutoff: 'April 2023',
        },
        developerId: 'dev-1',
      });
    });

    expect(messageService.success).toHaveBeenCalledWith('Model created successfully');
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should update the model when submitting in edit mode', async () => {
    const user = userEvent.setup();
    const { modelsApi, messageService, router } = await renderComponent({
      modelId: defaultModel.id,
    });
    const submitButton = screen.getByRole('button', { name: /update model/i });

    expect(submitButton).toBeInTheDocument();

    await waitFor(() => {
      expect(modelsApi.getById).toHaveBeenCalledWith(defaultModel.id);
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(modelsApi.update).toHaveBeenCalledWith(defaultModel.id, {
        name: defaultModel.name,
        shortName: defaultModel.shortName,
        value: defaultModel.value,
        link: defaultModel.link,
        price: defaultModel.price,
        supportsTemperature: defaultModel.supportsTemperature,
        isReasoning: defaultModel.isReasoning,
        reasoningLevel: defaultModel.reasoningLevel,
        guestAccess: defaultModel.guestAccess,
        metadata: defaultModel.metadata,
        developerId: defaultModel.developer.id,
      });
    });

    expect(messageService.success).toHaveBeenCalledWith('Model updated successfully');
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should navigate back when canceling', async () => {
    const user = userEvent.setup();
    const { router } = await renderComponent();
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    expect(cancelButton).toBeInTheDocument();

    await user.click(cancelButton);

    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should show validation messages and skip submit when required fields are missing', async () => {
    const user = userEvent.setup();
    const { modelsApi } = await renderComponent();
    const submitButton = screen.getByRole('button', { name: /create model/i });

    await user.click(submitButton);

    expect(modelsApi.create).not.toHaveBeenCalled();
    expect(screen.getByText('Please enter a valid name (max 100 characters)')).toBeInTheDocument();
    expect(screen.getByText('Please select a developer')).toBeInTheDocument();
  });

  it('should not navigate when create fails and should reset submitting state', async () => {
    const user = userEvent.setup();
    const { fixture, modelsApi, messageService, router } = await renderComponent({
      modelsApiOverrides: {
        create: vi.fn().mockRejectedValue(new Error('Failed')),
      },
    });
    const submitButton = screen.getByRole('button', { name: /create model/i });

    await fillRequiredFields(user, fixture.componentInstance.form);
    await user.click(submitButton);

    await waitFor(() => {
      expect(modelsApi.create).toHaveBeenCalled();
      expect(fixture.componentInstance.isSubmitting()).toBe(false);
    });

    expect(messageService.success).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});

const MODEL_NAME_MAX_LENGTH = 100;
const MODEL_SHORT_NAME_MAX_LENGTH = 20;
const MODEL_VALUE_MAX_LENGTH = 100;
const PRICE_MIN_VALUE = 0;
const TOKENS_MIN_VALUE = 1;
