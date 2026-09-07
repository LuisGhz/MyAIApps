import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideStore, Store } from '@ngxs/store';
import { provideEnvironmentInitializer, inject, Component, input, output } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideTestNzIcons } from '@sh/testing';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { MoreOptions } from './more-options';
import { ChatStore } from '@st/chat/chat.store';
import { ChatActions } from '@st/chat/chat.actions';
import { ChatApi } from '@chat/services/chat-api';
import { FileStoreService } from '@st/chat/services';

// Mock AdvancedSettings child component
@Component({
  selector: 'app-advanced-settings',
  template: '<div data-testid="mock-advanced-settings">Advanced Settings</div>',
})
class MockAdvancedSettings {
  isVisible = input.required<boolean>();
  closeModal = output<void>();
}

interface RenderOptions {
  currentChatId?: string | null;
  isImageGeneration?: boolean;
  isWebSearch?: boolean;
}

const mockChatApi = {
  updateAIFeatures: vi.fn().mockResolvedValue({}),
};

const mockFileStoreService = {
  storeFile: vi.fn().mockReturnValue('mock-file-id'),
  getFile: vi.fn(),
  removeFile: vi.fn(),
  clear: vi.fn(),
};

describe('MoreOptions', () => {
  const renderComponent = async (options: RenderOptions = {}) => {
    const {
      currentChatId = null,
      isImageGeneration = false,
      isWebSearch = false,
    } = options;

    const result = await render(MoreOptions, {
      providers: [
        provideHttpClient(),
        provideNoopAnimations(),
        provideTestNzIcons(),
        provideStore([ChatStore]),
        { provide: ChatApi, useValue: mockChatApi },
        { provide: FileStoreService, useValue: mockFileStoreService },
        provideEnvironmentInitializer(() => {
          const store = inject(Store);
          store.dispatch(new ChatActions.SetCurrentChatId(currentChatId));
          store.dispatch(new ChatActions.SetOps({ isImageGeneration, isWebSearch }));
        }),
      ],
      componentImports: [NzIconModule, MockAdvancedSettings],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, store };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create', async () => {
    const { fixture } = await renderComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should open menu when button is clicked', async () => {
    await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'More options menu' }));

    expect(screen.getByRole('menu', { name: 'Options menu' })).toBeInTheDocument();
  });

  it('should display all menu options when menu is opened', async () => {
    await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'More options menu' }));

    expect(screen.getByRole('menuitem', { name: /Agregar fotos y archivos/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Crea imagen/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Busca en la web/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Configuración avanzada/i })).toBeInTheDocument();
  });

  it('should enable image generation when option is clicked', async () => {
    const { store } = await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'More options menu' }));
    await user.click(screen.getByRole('menuitem', { name: /Crea imagen/i }));

    expect(store.selectSnapshot(ChatStore.isImageGeneration)).toBe(true);
  });

  it('should enable web search when option is clicked', async () => {
    const { store } = await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'More options menu' }));
    await user.click(screen.getByRole('menuitem', { name: /Busca en la web/i }));

    expect(store.selectSnapshot(ChatStore.isWebSearch)).toBe(true);
  });

  it('should close menu when option is clicked', async () => {
    const { fixture } = await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'More options menu' }));
    expect(fixture.componentInstance.isMenuOpen()).toBe(true);

    await user.click(screen.getByRole('menuitem', { name: /Crea imagen/i }));
    expect(fixture.componentInstance.isMenuOpen()).toBe(false);
  });

  it('should close menu when clicking outside the component', async () => {
    const { fixture } = await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'More options menu' }));
    expect(screen.getByRole('menu', { name: 'Options menu' })).toBeInTheDocument();

    await user.click(document.body);
    fixture.detectChanges();

    expect(fixture.componentInstance.isMenuOpen()).toBe(false);
    expect(screen.queryByRole('menu', { name: 'Options menu' })).not.toBeInTheDocument();
  });

  it('should not toggle image generation if already enabled', async () => {
    const { store } = await renderComponent({ isImageGeneration: true });
    const user = userEvent.setup();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    dispatchSpy.mockClear();

    await user.click(screen.getByRole('button', { name: 'More options menu' }));
    await user.click(screen.getByRole('menuitem', { name: /Crea imagen/i }));

    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(store.selectSnapshot(ChatStore.isImageGeneration)).toBe(true);
  });

  it('should not toggle web search if already enabled', async () => {
    const { store } = await renderComponent({ isWebSearch: true });
    const user = userEvent.setup();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    dispatchSpy.mockClear();

    await user.click(screen.getByRole('button', { name: 'More options menu' }));
    await user.click(screen.getByRole('menuitem', { name: /Busca en la web/i }));

    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(store.selectSnapshot(ChatStore.isWebSearch)).toBe(true);
  });

  it('should call updateAIFeatures when enabling image generation with existing chat', async () => {
    await renderComponent({ currentChatId: 'chat-123' });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'More options menu' }));
    await user.click(screen.getByRole('menuitem', { name: /Crea imagen/i }));

    expect(mockChatApi.updateAIFeatures).toHaveBeenCalledWith('chat-123', {
      isImageGeneration: true,
      isWebSearch: false,
    });
  });

  it('should call updateAIFeatures when enabling web search with existing chat', async () => {
    await renderComponent({ currentChatId: 'chat-456' });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'More options menu' }));
    await user.click(screen.getByRole('menuitem', { name: /Busca en la web/i }));

    expect(mockChatApi.updateAIFeatures).toHaveBeenCalledWith('chat-456', {
      isWebSearch: true,
      isImageGeneration: false,
    });
  });

  it('should show advanced settings modal when configuration option is clicked', async () => {
    const { fixture } = await renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'More options menu' }));
    await user.click(screen.getByRole('menuitem', { name: /Configuración avanzada/i }));

    expect(fixture.componentInstance.isAdvancedSettingsVisible()).toBe(true);
  });

  it('should close advanced settings modal when closeAdvancedSettings is called', async () => {
    const { fixture } = await renderComponent();

    fixture.componentInstance.isAdvancedSettingsVisible.set(true);
    fixture.componentInstance.closeAdvancedSettings();

    expect(fixture.componentInstance.isAdvancedSettingsVisible()).toBe(false);
  });
});
