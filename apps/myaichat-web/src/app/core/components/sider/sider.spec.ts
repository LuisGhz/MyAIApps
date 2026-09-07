import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Component, inject, Input, provideEnvironmentInitializer } from '@angular/core';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { Store, provideStore } from '@ngxs/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { Sider } from './sider';
import { AppStore } from '@st/app/app.store';
import { ChatStore } from '@st/chat/chat.store';
import { AuthStore } from '@st/auth/auth.store';
import { AuthActions } from '@st/auth/auth.actions';
import { ChatApi } from '@chat/services/chat-api';
import {
  createMockNzModalService,
  createTestJwt,
  provideTestNzIcons,
} from '@sh/testing';
import type { UserChatsModel } from '@chat/models/chat.model';

// Mock More component
@Component({
  selector: 'app-more',
  template: '<div>Mock More</div>',
})
class MockMore {}

// Mock BottomSider component
@Component({
  selector: 'app-bottom-sider',
  template: '<div>Mock BottomSider</div>',
})
class MockBottomSider {}

// Mock RenameChatModal component
@Component({
  selector: 'app-rename-chat-modal',
  template: '<div>Mock RenameChatModal</div>',
})
class MockRenameChatModal {
  @Input() isVisible = false;
  @Input() chatTitle = '';
}

const mockChats: UserChatsModel[] = [
  { id: '1', title: 'Chat 1', createdAt: new Date('2024-01-01') },
  { id: '2', title: 'Chat 2', createdAt: new Date('2024-01-02') },
  { id: '3', title: 'Chat 3', createdAt: new Date('2024-01-03') },
];

interface RenderOptions {
  chats?: UserChatsModel[];
  isMobile?: boolean;
  sidebarCollapsed?: boolean;
  currentChatId?: string | null;
  modalServiceOverrides?: Partial<ReturnType<typeof createMockNzModalService>>;
}

describe('Sider', () => {
  let mockChatApi: any;
  let mockModalService: ReturnType<typeof createMockNzModalService>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChatApi = {
      getChats: vi.fn().mockReturnValue(Promise.resolve(mockChats)),
      deleteChat: vi.fn().mockResolvedValue(undefined),
      renameChat: vi.fn().mockResolvedValue(undefined),
    };

    mockModalService = createMockNzModalService();
  });

  const renderComponent = async (options?: RenderOptions) => {
    const result = await render(Sider, {
      providers: [
        provideStore([AppStore, ChatStore, AuthStore]),
        provideHttpClient(),
        provideNoopAnimations(),
        provideTestNzIcons(),
        provideRouter([
          { path: '', component: {} as any },
          { path: 'chat/:id', component: {} as any },
        ]),
        { provide: ChatApi, useValue: mockChatApi },
        {
          provide: NzModalService,
          useValue: options?.modalServiceOverrides
            ? { ...mockModalService, ...options.modalServiceOverrides }
            : mockModalService,
        },
        provideEnvironmentInitializer(() => {
          const store = inject(Store);
          store.dispatch(new AuthActions.Login({ token: createTestJwt() }));

          // Set up initial app state
          if (options?.chats) {
            store.dispatch({
              type: '[App] Update User Chats',
              payload: options.chats,
            });
          }

          if (options?.isMobile !== undefined) {
            store.dispatch({
              type: '[App] Is Mobile',
              payload: options.isMobile,
            });
          }

          if (options?.sidebarCollapsed !== undefined) {
            const action = options.sidebarCollapsed
              ? { type: '[App] Collapse Sidebar' }
              : { type: '[App] UnCollapse Sidebar' };
            store.dispatch(action);
          }

          if (options?.currentChatId !== undefined) {
            store.dispatch({
              type: '[Chat] Set Current Chat Id',
              payload: options.currentChatId,
            });
          }
        }),
      ],
      componentImports: [
        FormsModule,
        RouterLink,
        NzInputModule,
        NzIconModule,
        NzButtonModule,
        NzSkeletonModule,
        NzMenuModule,
        MockMore,
        MockBottomSider,
        MockRenameChatModal,
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);
    const router = result.fixture.debugElement.injector.get(Router);

    return { ...result, store, mockChatApi, mockModalService, router };
  };

  it('should display chat list after loading completes', async () => {
    await renderComponent({ chats: mockChats });

    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Chat 2')).toBeInTheDocument();
    expect(screen.getByText('Chat 3')).toBeInTheDocument();
  });

  it('should filter chats when typing in search input', async () => {
    await renderComponent({ chats: mockChats });
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar chats');
    await user.type(searchInput, 'Chat 1');

    expect(screen.getByText('Chat 1')).toBeInTheDocument();
    expect(screen.queryByText('Chat 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Chat 3')).not.toBeInTheDocument();
  });

  it('should toggle sidebar when clicking menu fold button', async () => {
    const { store, fixture } = await renderComponent({ sidebarCollapsed: false });
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
    });

    const toggleButton = fixture.nativeElement.querySelector('button:has(span[nztype="menu-fold"])');
    expect(toggleButton).toBeInTheDocument();
    await user.click(toggleButton);

    const state = store.selectSnapshot((s: any) => s.app);
    expect(state.sidebarCollapsed).toBe(true);
  });

  it('should show confirm modal and delete chat when confirmed', async () => {
    let capturedOnOk: (() => Promise<void>) | undefined;
    const mockConfirm = vi.fn().mockImplementation((config: any) => {
      capturedOnOk = config.nzOnOk;
      return { afterClose: { subscribe: vi.fn() } };
    });

    const { store, fixture } = await renderComponent({
      chats: mockChats,
      modalServiceOverrides: { confirm: mockConfirm },
    });

    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
    });

    const chatItem = screen.getByText('Chat 1').closest('a[class*="group"]');
    expect(chatItem).toBeInTheDocument();

    const moreComponent = chatItem!.querySelector('app-more');
    expect(moreComponent).toBeInTheDocument();

    const deleteEvent = new CustomEvent('deleteChat', { bubbles: true });
    moreComponent!.dispatchEvent(deleteEvent);

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        nzTitle: 'Are you sure you want to delete this chat?',
        nzOkText: 'Delete',
      }),
    );

    await capturedOnOk!();

    expect(mockChatApi.deleteChat).toHaveBeenCalledWith('1');

    const state = store.selectSnapshot((s: any) => s.app);
    expect(state.userChats).not.toContainEqual(expect.objectContaining({ id: '1' }));
  });

  it('should collapse sidebar when clicking a chat on mobile', async () => {
    const { store, fixture } = await renderComponent({
      chats: mockChats,
      isMobile: true,
      sidebarCollapsed: false,
    });

    await waitFor(() => {
      expect(screen.getByText('Chat 1')).toBeInTheDocument();
    });

    const componentInstance = fixture.componentInstance as Sider;
    componentInstance.collapseIfMobileAndNotCollapsed();
    await fixture.whenStable();

    const state = store.selectSnapshot((s: any) => s.app);
    expect(state.sidebarCollapsed).toBe(true);
  });
});
