import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzInputModule } from 'ng-zorro-antd/input';
import { dispatch, select } from '@ngxs/store';
import { AppStore } from '@st/app/app.store';
import { AppActions } from '@st/app/app.actions';
import { ChatStore } from '@st/chat/chat.store';
import { ChatApi } from '@chat/services/chat-api';
import { More } from '../more/more';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { RenameChatModal } from '@chat/modals/rename-chat-modal/rename-chat-modal';
import { BottomSider } from '../bottom-sider/bottom-sider';

@Component({
  selector: 'app-sider',
  imports: [
    FormsModule,
    RouterLink,
    NzButtonModule,
    NzIconModule,
    NzTooltipDirective,
    NzMenuModule,
    NzSkeletonModule,
    NzInputModule,
    NzIconModule,
    More,
    NzModalModule,
    RenameChatModal,
    BottomSider,
  ],
  templateUrl: './sider.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sider {
  readonly #router = inject(Router);
  readonly #modalService = inject(NzModalService);
  readonly #chatApi = inject(ChatApi);
  readonly chatsResource = resource({
    loader: () => this.#chatApi.getChats(),
  });
  readonly #userChats = select(AppStore.userChats);
  readonly #isMobile = select(AppStore.isMobile);
  readonly #isSidebarCollapsed = select(AppStore.sidebarCollapsed);
  readonly #updateUserChats = dispatch(AppActions.UpdateUserChats);
  readonly #toggleSidebar = dispatch(AppActions.ToggleSidebar);
  readonly #deleteChat = dispatch(AppActions.DeleteChat);
  readonly #renameChat = dispatch(AppActions.RenameChat);
  readonly #collapseSidebar = dispatch(AppActions.CollapseSidebar);
  readonly filteredChats = computed(() => {
    const chats = this.#userChats() ?? [];
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return chats;
    return chats.filter((chat) => chat.title?.toLowerCase().includes(query));
  });
  searchQuery = signal('');
  isDeleteChatModalVisible = signal(false);
  chatIdToDelete = signal<string | null>(null);
  chatIdToRename = signal<string | null>(null);
  isRenameChatModalVisible = signal(false);
  chatTitleToRename = signal<string | null>(null);
  readonly sidebarCollapsed = select(AppStore.sidebarCollapsed);
  readonly currentChatId = select(ChatStore.getCurrentChatId);

  constructor() {
    effect(() => {
      this.#updateUserChats(this.chatsResource.value() ?? []);
    });
  }

  onToggleSidebar(): void {
    this.#toggleSidebar();
  }

  onDeleteChatConfirmed(chatId: string): void {
    this.#modalService.confirm({
      nzTitle: 'Are you sure you want to delete this chat?',
      nzOkText: 'Delete',
      nzOnOk: async () => {
        const originalChats = this.#userChats();
        try {
          await this.#chatApi.deleteChat(chatId);
          this.#deleteChat(chatId);
          if (this.currentChatId() === chatId) await this.#router.navigateByUrl('/');
        } catch (error) {
          this.#updateUserChats(originalChats);
        }
      },
      nzOnCancel: () => {},
    });
  }

  onRenameChat(chatId: string): void {
    this.chatIdToRename.set(chatId);
    this.isRenameChatModalVisible.set(true);
    const chat = this.#userChats().find((c) => c.id === chatId)!;
    this.chatTitleToRename.set(chat.title!);
  }

  async onSaveRename(newTitle: string): Promise<void> {
    const chatId = this.chatIdToRename();
    if (chatId) {
      this.#renameChat({ chatId, newTitle });
      try {
        await this.#chatApi.renameChat(chatId, newTitle);
      } catch {
        this.#renameChat({ chatId, newTitle: this.chatTitleToRename()! });
      }
    }
    this.isRenameChatModalVisible.set(false);
    this.chatIdToRename.set(null);
    this.chatTitleToRename.set(null);
  }

  onCancelRename(): void {
    this.isRenameChatModalVisible.set(false);
  }

  collapseIfMobileAndNotCollapsed(): void {
    if (this.#isMobile() && !this.#isSidebarCollapsed()) {
      this.#collapseSidebar();
    }
  }
}
