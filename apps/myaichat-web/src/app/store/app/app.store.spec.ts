import { Component } from '@angular/core';
import { Store, provideStore } from '@ngxs/store';
import { render } from '@testing-library/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { UserChatsModel } from '@chat/models/chat.model';
import { AppActions } from './app.actions';
import { AppStore } from './app.store';

@Component({
  template: '',
})
class TestHost {}

describe('AppStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderStore = async () => {
    const result = await render(TestHost, {
      providers: [provideStore([AppStore])],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, store };
  };

  it('should expose the default state through selectors', async () => {
    const { store } = await renderStore();

    expect(store.selectSnapshot(AppStore.sidebarCollapsed)).toBe(false);
    expect(store.selectSnapshot(AppStore.isMobile)).toBe(false);
    expect(store.selectSnapshot(AppStore.selectedChatId)).toBeNull();
    expect(store.selectSnapshot(AppStore.userChats)).toEqual([]);
    expect(store.selectSnapshot(AppStore.pageTitle)).toBe('New Chat');
  });

  it('should update layout-related state when sidebar and page actions are dispatched', async () => {
    const { store } = await renderStore();

    await firstValueFrom(store.dispatch(new AppActions.ToggleSidebar()));
    expect(store.selectSnapshot(AppStore.sidebarCollapsed)).toBe(true);

    await firstValueFrom(store.dispatch(new AppActions.CollapseSidebar()));
    expect(store.selectSnapshot(AppStore.sidebarCollapsed)).toBe(true);

    await firstValueFrom(store.dispatch(new AppActions.UnCollapseSidebar()));
    expect(store.selectSnapshot(AppStore.sidebarCollapsed)).toBe(false);

    await firstValueFrom(store.dispatch(new AppActions.SetIsMobile(true)));
    await firstValueFrom(store.dispatch(new AppActions.SelectChat('chat-1')));
    await firstValueFrom(store.dispatch(new AppActions.SetPageTitle('Prompts')));

    expect(store.selectSnapshot(AppStore.isMobile)).toBe(true);
    expect(store.selectSnapshot(AppStore.selectedChatId)).toBe('chat-1');
    expect(store.selectSnapshot(AppStore.pageTitle)).toBe('Prompts');
  });

  it('should manage the user chats collection through add, rename, update, and delete actions', async () => {
    const { store } = await renderStore();

    const olderChat: UserChatsModel = {
      id: 'chat-1',
      title: 'Older chat',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    };
    const newerChat: UserChatsModel = {
      id: 'chat-2',
      title: 'Newer chat',
      createdAt: new Date('2024-01-02T00:00:00.000Z'),
    };

    await firstValueFrom(store.dispatch(new AppActions.UpdateUserChats([olderChat])));
    await firstValueFrom(store.dispatch(new AppActions.AddUserChat(newerChat)));

    expect(store.selectSnapshot(AppStore.userChats)).toEqual([newerChat, olderChat]);

    await firstValueFrom(
      store.dispatch(
        new AppActions.RenameChat({
          chatId: newerChat.id,
          newTitle: 'Renamed chat',
        }),
      ),
    );

    expect(store.selectSnapshot(AppStore.userChats)).toEqual([
      { ...newerChat, title: 'Renamed chat' },
      olderChat,
    ]);

    await firstValueFrom(store.dispatch(new AppActions.DeleteChat(olderChat.id)));

    expect(store.selectSnapshot(AppStore.userChats)).toEqual([
      { ...newerChat, title: 'Renamed chat' },
    ]);
  });
});
