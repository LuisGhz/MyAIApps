import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/angular';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Store, provideStore } from '@ngxs/store';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SuccessPage } from './success';
import { AuthStore } from '@st/auth/auth.store';
import { createMockActivatedRoute, createMockRouter, provideTestNzIcons } from '@sh/testing';
import { AuthActions } from '@st/auth/auth.actions';
import { of } from 'rxjs';

interface RenderOptions {
	queryParams?: Params;
	routerOverrides?: Partial<Router>;
}

describe('SuccessPage', () => {
	const renderComponent = async (options?: RenderOptions) => {
		const mockActivatedRoute = createMockActivatedRoute({
			queryParams: options?.queryParams ?? {},
		});
		const mockRouter = createMockRouter(options?.routerOverrides ?? {});

		const result = await render(SuccessPage, {
			providers: [
				provideStore([AuthStore]),
				provideNoopAnimations(),
				provideTestNzIcons(),
				{ provide: ActivatedRoute, useValue: mockActivatedRoute },
				{ provide: Router, useValue: mockRouter },
			],
		});

		const store = result.fixture.debugElement.injector.get(Store);

		return { ...result, store, mockRouter, mockActivatedRoute };
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('should dispatch login and navigate to home with access token', async () => {
		vi.useFakeTimers();
		const accessToken = 'token-123';
		const dispatchSpy = vi
			.spyOn(Store.prototype, 'dispatch')
			.mockReturnValue(of(void 0));

		const { mockRouter } = await renderComponent({
			queryParams: { accessToken },
		});

		await waitFor(() => {
			expect(dispatchSpy).toHaveBeenCalled();
		});

		const [action] = dispatchSpy.mock.calls[0];
		expect(action).toBeInstanceOf(AuthActions.Login);
		expect((action as AuthActions.Login).payload).toEqual({ token: accessToken });

		vi.runAllTimers();

		await waitFor(() => {
			expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
		});
	});

	it('should redirect to login when access token is missing', async () => {
		const { mockRouter } = await renderComponent({ queryParams: {} });

		await waitFor(() => {
			expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
		});
	});

	it('should not dispatch login when access token is missing', async () => {
		const dispatchSpy = vi
			.spyOn(Store.prototype, 'dispatch')
			.mockReturnValue(of(void 0));

		const { mockRouter } = await renderComponent({ queryParams: {} });

		await waitFor(() => {
			expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
		});

		expect(dispatchSpy).not.toHaveBeenCalled();
	});

	it('should not redirect to login when access token is present', async () => {
		vi.useFakeTimers();
		const accessToken = 'token-456';
		const dispatchSpy = vi
			.spyOn(Store.prototype, 'dispatch')
			.mockReturnValue(of(void 0));

		const { mockRouter } = await renderComponent({
			queryParams: { accessToken },
		});

		await waitFor(() => {
			expect(dispatchSpy).toHaveBeenCalled();
		});

		expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/auth/login']);

		vi.runAllTimers();

		await waitFor(() => {
			expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
		});
	});
});
