import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ActivatedRoute, Params } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LoginPage } from './login';
import { createMockActivatedRoute, provideTestNzIcons } from '@sh/testing';
import { environment } from 'src/environments/environment';

interface RenderOptions {
	queryParams?: Params;
}

describe('LoginPage', () => {
	const renderComponent = async (options?: RenderOptions) => {
		const mockActivatedRoute = createMockActivatedRoute({
			queryParams: options?.queryParams ?? {},
		});

		return render(LoginPage, {
			providers: [
				{ provide: ActivatedRoute, useValue: mockActivatedRoute },
				provideNoopAnimations(),
				provideTestNzIcons(),
			],
		});
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render heading and login button', async () => {
		await renderComponent();

		expect(
			screen.getByRole('heading', { name: /bienvenido/i })
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /iniciar sesión con github/i })
		).toBeInTheDocument();
	});

	it('should show error message from query params', async () => {
		const message = 'Token inválido';

		await renderComponent({ queryParams: { errorMessage: message } });

		expect(screen.getByText(message)).toBeInTheDocument();
	});

	it('should not render error message when query param is missing', async () => {
		await renderComponent();

		expect(screen.queryByText(/token inválido/i)).not.toBeInTheDocument();
	});

	it('should redirect to github login when button is clicked', async () => {
		const user = userEvent.setup();
		const originalLocation = window.location;

		Object.defineProperty(window, 'location', {
			configurable: true,
			value: { href: 'http://localhost/' },
		});

		await renderComponent();
		await user.click(
			screen.getByRole('button', { name: /iniciar sesión con github/i })
		);

		expect(window.location.href).toBe(`${environment.apiUrl}/auth/login`);

		Object.defineProperty(window, 'location', {
			configurable: true,
			value: originalLocation,
		});
	});

	it('should hide error message when clearError is called', async () => {
		const message = 'Token inválido';
		const { fixture } = await renderComponent({
			queryParams: { errorMessage: message },
		});

		expect(screen.getByText(message)).toBeInTheDocument();

		fixture.componentInstance.clearError();
		fixture.detectChanges();

		expect(screen.queryByText(message)).not.toBeInTheDocument();
	});
});
