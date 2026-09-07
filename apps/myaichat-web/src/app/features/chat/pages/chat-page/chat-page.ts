import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  linkedSignal,
  OnInit,
  resource,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputMessage } from '@chat/components/input/input-message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AiModelsApi } from '@chat/services/ai-models-api';
import { AiModelModel } from '@chat/models';
import { dispatch, select } from '@ngxs/store';
import { ChatStore } from '@st/chat/chat.store';
import { Messages } from '@chat/components/messages/messages';
import { ChatApi } from '@chat/services/chat-api';
import { ActivatedRoute } from '@angular/router';
import { ChatActions } from '@st/chat/chat.actions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AppStore } from '@st/app/app.store';
import { AppActions } from '@st/app/app.actions';

@Component({
  selector: 'app-chat-view',
  imports: [FormsModule, NzSelectModule, InputMessage, Messages],
  templateUrl: './chat-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPage implements OnInit, AfterViewInit {
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #destroyRef = inject(DestroyRef);
  readonly #chatApi = inject(ChatApi);
  readonly #aiModelsApi = inject(AiModelsApi);
  readonly models = resource({
    loader: () => this.#aiModelsApi.getAiModels(),
    defaultValue: [],
  });
  readonly prompts = resource({
    loader: () => this.#chatApi.getPrompts(),
    defaultValue: [],
  });
  readonly #userChats = select(AppStore.userChats);
  readonly messages = select(ChatStore.getMessages);
  readonly #currentChatId = select(ChatStore.getCurrentChatId);
  readonly hasMoreMessages = select(ChatStore.hasMoreMessages);
  readonly isLoadingOlderMessages = select(ChatStore.isLoadingOlderMessages);
  readonly #resetChat = dispatch(ChatActions.ResetChat);
  readonly #setOps = dispatch(ChatActions.SetOps);
  readonly #setCurrentChatId = dispatch(ChatActions.SetCurrentChatId);
  readonly #prependMessages = dispatch(ChatActions.PrependMessages);
  readonly #setIsLoadingOlderMessages = dispatch(ChatActions.SetIsLoadingOlderMessages);
  readonly #setPageTitle = dispatch(AppActions.SetPageTitle);
  readonly groupedModels = computed(() => {
    const modelList = this.models.value();
    const grouped = new Map<string, AiModelModel[]>();

    modelList.forEach((model) => {
      const developerName = model.developer.name;
      if (!grouped.has(developerName)) {
        grouped.set(developerName, []);
      }
      grouped.get(developerName)!.push(model);
    });

    return grouped;
  });
  readonly shouldAnimateTransition = computed(() => !this.#isLoadedChat());
  readonly #isLoadedChat = signal(false);
  selectedModel = linkedSignal(() => {
    const models = this.models.value();
    return models.length > 0 ? models[0].id : null;
  });
  selectedPrompt = signal<string | null>(null);
  messagesContainer = viewChild<ElementRef<HTMLElement>>('messagesContainer');

  constructor() {
    effect(() => {
      // Re-run this effect when navigating between `/` and `/chat/:id`.
      // This keeps store ops in sync after ResetChat() clears model fields.
      this.#isLoadedChat();
      const modelId = this.selectedModel();
      const model = this.models.value().find((m) => m.id === modelId);
      if (model)
        this.#setOps({
          modelDeveloper: model.developer.name,
          modelId: model.id,
        });
    });

    effect(() => {
      const promptId = this.selectedPrompt();
      this.#setOps({
        promptId: promptId || undefined,
      });
    });

    effect(() => {
      if (this.messages().length > 0 && this.messages()[this.messages().length - 1].role === 'user')
        setTimeout(() => {
          this.#scrollToBottom();
        }, 100);
    });
  }

  ngOnInit(): void {
    this.#activatedRoute.params.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((params) => {
      const chatId = params['id'];
      if (chatId) {
        this.#isLoadedChat.set(true);
        const hasMessages = this.messages().length > 0;
        const isAlreadyOnThatChat = this.#currentChatId() === chatId;

        this.#setCurrentChatId(chatId);

        // If this navigation happens right after creating a new chat, the store already has
        // the streamed messages, so re-loading would duplicate work (and can duplicate messages).
        if (!(hasMessages && isAlreadyOnThatChat)) {
          this.#chatApi.loadMessages(chatId);
        }
        this.#setChatTitle(chatId);
      } else {
        this.#isLoadedChat.set(false);
        this.#setCurrentChatId(null);
        this.#resetChat();
        this.#setChatTitle(null);
        this.#resetSelections();
      }
      this.#scrollToBottom();
    });
  }

  #setChatTitle(currentChatId: string | null): void {
    if (currentChatId === null) {
      this.#setPageTitle('New Chat');
      return;
    }

    const currentChat = this.#userChats().find((chat) => chat.id === currentChatId);
    if (!currentChatId) return;
    const title = currentChat ? currentChat.title : 'New Chat';
    this.#setPageTitle(title!);
  }

  ngAfterViewInit(): void {
    this.#scrollToBottom();
    this.#setupScrollListener();
  }

  #scrollToBottom(): void {
    setTimeout(() => {
      this.messagesContainer()?.nativeElement.scrollTo({
        top: this.messagesContainer()!.nativeElement.scrollHeight,
        behavior: 'smooth',
      });
    }, 250);
  }

  #setupScrollListener(): void {
    const container = this.messagesContainer()?.nativeElement;
    if (!container) return;

    fromEvent(container, 'scroll')
      .pipe(debounceTime(100), takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.#onScroll();
      });
  }

  #onScroll(): void {
    const container = this.messagesContainer()?.nativeElement;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const threshold = 50;

    if (
      scrollTop <= threshold &&
      this.hasMoreMessages() &&
      !this.isLoadingOlderMessages() &&
      this.messages().length > 0
    ) {
      this.#loadOlderMessages();
    }
  }

  async #loadOlderMessages(): Promise<void> {
    const currentChatId = this.#activatedRoute.snapshot.params['id'];
    if (!currentChatId) return;

    const oldestMessage = this.messages()[0];
    if (!oldestMessage?.id) return;

    const container = this.messagesContainer()?.nativeElement;
    if (!container) return;

    const previousScrollHeight = container.scrollHeight;

    this.#setIsLoadingOlderMessages(true);

    try {
      const result = await this.#chatApi.loadOlderMessages(currentChatId, oldestMessage.id);
      this.#prependMessages({
        messages: result.messages,
        hasMore: result.hasMore,
      });

      setTimeout(() => {
        const newScrollHeight = container.scrollHeight;
        const scrollDifference = newScrollHeight - previousScrollHeight;
        container.scrollTop = scrollDifference;
      }, 0);
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      this.#setIsLoadingOlderMessages(false);
    }
  }

  #resetSelections(): void {
    const models = this.models.value();
    const defaultModel = models.length > 0 ? models[0].id : null;
    this.selectedModel.set(defaultModel);
    this.selectedPrompt.set(null);
  }
}
