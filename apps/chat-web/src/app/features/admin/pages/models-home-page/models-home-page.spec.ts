import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideStore } from '@ngxs/store';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AppStore } from '@st/app/app.store';
import { createMockNzMessageService, createMockNzModalService, createMockRouter, provideTestNzIcons } from '@sh/testing';

import { ModelsHomePage } from './models-home-page';
import { ModelsApi } from '../../services';
import { ModelListItemResModel } from '../../models';

type NzMessageServiceMock = ReturnType<typeof createMockNzMessageService>;
type NzModalServiceMock = ReturnType<typeof createMockNzModalService>;

const defaultModels: ModelListItemResModel[] = [
	{
		id: 'model-1',
		name: 'GPT-4 Turbo',
		shortName: 'GPT-4T',
		value: 'gpt-4-turbo',
		guestAccess: false,
		developer: { name: 'OpenAI', imageUrl: 'https://example.com/openai.png' },
	},
];

const createModelsApiMock = (overrides?: Partial<ModelsApi>) => ({
	fetchAll: vi.fn().mockResolvedValue(defaultModels),
	deleteModel: vi.fn().mockResolvedValue(undefined),
	...overrides,
});

interface RenderOptions {
	models?: ModelListItemResModel[];
	routerOverrides?: Partial<Router>;
	modelsApiOverrides?: Partial<ModelsApi>;
	messageOverrides?: Partial<NzMessageServiceMock>;
	modalOverrides?: Partial<NzModalServiceMock>;
}

describe('ModelsHomePage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderComponent = async (options: RenderOptions = {}) => {
		const modelsApi = createModelsApiMock({
			fetchAll: vi.fn().mockResolvedValue(options.models ?? defaultModels),
			...options.modelsApiOverrides,
		});
		const router = createMockRouter(options.routerOverrides);
		const messageService = createMockNzMessageService(options.messageOverrides);
		const modalService = createMockNzModalService(options.modalOverrides);

		const renderResult = await render(ModelsHomePage, {
			providers: [
				provideStore([AppStore]),
				provideNoopAnimations(),
				provideTestNzIcons(),
				{ provide: ModelsApi, useValue: modelsApi },
				{ provide: Router, useValue: router },
				{ provide: NzMessageService, useValue: messageService },
			],
			componentProviders: [{ provide: NzModalService, useValue: modalService }],
		});

		return {
			...renderResult,
			modelsApi,
			router,
			messageService,
			modalService,
		};
	};

	it('should render model data when loading completes', async () => {
		await renderComponent();

		await waitFor(() => {
			expect(screen.getByText('GPT-4 Turbo')).toBeInTheDocument();
		});

		expect(screen.getByText('GPT-4T')).toBeInTheDocument();
		expect(screen.getByText('gpt-4-turbo')).toBeInTheDocument();
		expect(screen.getByText('No')).toBeInTheDocument();
	});

	it('should navigate to the create page when clicking new model', async () => {
		const user = userEvent.setup();
		const { router } = await renderComponent();
		const addButton = screen.getByRole('button', { name: /new model/i });

		await user.click(addButton);

		expect(router.navigate).toHaveBeenCalledWith(['/admin/models/new']);
	});

	it('should navigate to the edit page when clicking the edit action', async () => {
		const user = userEvent.setup();
		const { router } = await renderComponent();

		await waitFor(() => {
			expect(screen.getByText('GPT-4 Turbo')).toBeInTheDocument();
		});

		await user.click(screen.getByRole('button', { name: /edit model/i }));

		expect(router.navigate).toHaveBeenCalledWith(['/admin/models', 'model-1']);
	});

	it('should delete the model after confirming the dialog', async () => {
		const user = userEvent.setup();
		let confirmConfig: Parameters<NzModalServiceMock['confirm']>[0] | null = null;
		const { modelsApi, messageService, modalService } = await renderComponent({
			modalOverrides: {
				confirm: vi.fn().mockImplementation((config) => {
					confirmConfig = config;
					return {} as ReturnType<NzModalServiceMock['confirm']>;
				}),
			},
		});

		await waitFor(() => {
			expect(screen.getByText('GPT-4 Turbo')).toBeInTheDocument();
		});

		await user.click(screen.getByRole('button', { name: /delete model/i }));

		expect(modalService.confirm).toHaveBeenCalled();
		expect(confirmConfig?.nzOnOk).toBeDefined();

		await confirmConfig?.nzOnOk?.();

		await waitFor(() => {
			expect(modelsApi.deleteModel).toHaveBeenCalledWith('model-1');
		});

		expect(messageService.success).toHaveBeenCalledWith('Model deleted successfully');
	});

	it('should render no model rows when the list is empty', async () => {
		const { modelsApi } = await renderComponent({ models: [] });

		await waitFor(() => {
			expect(modelsApi.fetchAll).toHaveBeenCalled();
		});

		expect(screen.queryByRole('button', { name: /edit model/i })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /delete model/i })).not.toBeInTheDocument();
	});

	it('should not show success message when delete fails', async () => {
		const user = userEvent.setup();
		let confirmConfig: Parameters<NzModalServiceMock['confirm']>[0] | null = null;
		const { modelsApi, messageService, modalService } = await renderComponent({
			modelsApiOverrides: {
				deleteModel: vi.fn().mockRejectedValue(new Error('Failed')),
			},
			modalOverrides: {
				confirm: vi.fn().mockImplementation((config) => {
					confirmConfig = config;
					return {} as ReturnType<NzModalServiceMock['confirm']>;
				}),
			},
		});

		await waitFor(() => {
			expect(screen.getByText('GPT-4 Turbo')).toBeInTheDocument();
		});

		await user.click(screen.getByRole('button', { name: /delete model/i }));

		expect(modalService.confirm).toHaveBeenCalled();
		expect(confirmConfig?.nzOnOk).toBeDefined();

		await confirmConfig?.nzOnOk?.();

		await waitFor(() => {
			expect(modelsApi.deleteModel).toHaveBeenCalledWith('model-1');
		});

		expect(messageService.success).not.toHaveBeenCalled();
	});
});
