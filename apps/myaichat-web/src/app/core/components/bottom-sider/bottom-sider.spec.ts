import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { BottomSider } from './bottom-sider';
import { Router } from '@angular/router';
import { Store, provideStore } from '@ngxs/store';
import { AuthApi } from '@core/services/auth-api';
import { AppStore } from '@st/app/app.store';
import { AuthStore } from '@st/auth/auth.store';
import { createMockRouter, createTestJwt, provideTestNzIcons } from '@sh/testing';
import { inject, provideEnvironmentInitializer } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AuthActions } from '@st/auth/auth.actions';
import { JwtPayloadModel } from '@st/auth/models';

const mockAuthApi = {
  logout: vi.fn().mockReturnValue(of(undefined)),
};

const mockRouter = createMockRouter();

interface RenderOptions {
  jwtPayload?: Partial<JwtPayloadModel>;
}

describe('BottomSider', () => {
  const renderComponent = async (options?: RenderOptions) => {
    const result = await render(BottomSider, {
      providers: [
        provideStore([AppStore, AuthStore]),
        provideNoopAnimations(),
        provideTestNzIcons(),
        { provide: Router, useValue: mockRouter },
        { provide: AuthApi, useValue: mockAuthApi },
        provideEnvironmentInitializer(() => {
          const store = inject(Store);
          const token = createTestJwt(options?.jwtPayload);
          store.dispatch(new AuthActions.Login({ token }));
        }),
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, store };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create the component', async () => {
    const { fixture } = await renderComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the username', async () => {
    await renderComponent();
    expect(screen.getByText('test@example.com')).toBeTruthy();
  });

  it('should open menu when user button is clicked', async () => {
    await renderComponent();
    const user = userEvent.setup();

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /user button/i }));

    expect(screen.getByRole('menu', { name: /options menu/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /logout/i })).toBeInTheDocument();
  });

  it('should close menu when clicking outside the component', async () => {
    await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /user button/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should display user menu with email and username when menu is open', async () => {
    await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /user button/i }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@test@example.com')).toBeInTheDocument();
  });

  it('should toggle menu when user button is clicked multiple times', async () => {
    await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /user button/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /user button/i }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should display default letter U when username is empty', async () => {
    const { fixture } = await renderComponent({ jwtPayload: { name: '' } });
    const component = fixture.componentInstance;

    expect(component.firstLetterOfUsername()).toBe('U');
  });

  it('should display first letter T of username Test User', async () => {
    const { fixture } = await renderComponent();
    const component = fixture.componentInstance;

    expect(component.firstLetterOfUsername()).toBe('T');
  });

  it('should invoke menu option onClick handler when clicked', async () => {
    const { fixture } = await renderComponent();
    const component = fixture.componentInstance;
    const user = userEvent.setup();

    const mockOption = { icon: 'setting', label: 'Test', onClick: vi.fn() };
    component.menuOptions.set([mockOption]);
    fixture.detectChanges();

    await user.click(screen.getByRole('button', { name: /user button/i }));
    await user.click(screen.getByRole('menuitem', { name: /test/i }));

    expect(mockOption.onClick).toHaveBeenCalled();
  });
});
