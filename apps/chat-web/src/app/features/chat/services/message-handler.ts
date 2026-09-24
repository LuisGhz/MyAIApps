import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ChatStreamApi } from './chat-stream-api';
import { ChatActions } from '@st/chat/chat.actions';
import { dispatch, select } from '@ngxs/store';
import { ChatStore } from '@st/chat/chat.store';
import { FileStoreService } from '@st/chat/services/file-store.service';
import { StreamDoneEvent } from '@chat/models';
import { AppActions } from '@st/app/app.actions';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'any',
})
export class MessagesHandler {
  #chatStreamApi = inject(ChatStreamApi);
  #router = inject(Router);
  #fileStore = inject(FileStoreService);
  #removeFile = dispatch(ChatActions.RemoveFile);
  #messages = select(ChatStore.getMessages);
  #addUserMessage = dispatch(ChatActions.AddUserMessage);
  #addAssistantMessage = dispatch(ChatActions.AddAssistantMessage);
  #addAssistantChunk = dispatch(ChatActions.AddAssistantChunk);
  #setMessagesMetadata = dispatch(ChatActions.SetMessagesMetadata);
  #chatOps = select(ChatStore.getOps);
  #addUserChat = dispatch(AppActions.AddUserChat);
  #setIsSending = dispatch(ChatActions.SetIsSending);
  #setCurrentChatId = dispatch(ChatActions.SetCurrentChatId);

  handleUserMessage(message: string, chatId?: string): void {
    const ops = this.#chatOps();
    const file = ops.file ? this.#fileStore.getFile(ops.file.id) : undefined;
    this.#addUserMessage(message, file);
    this.#removeFile();
    this.#setIsSending(true);
    this.#chatStreamApi
      .sendMessage({
        message,
        chatId,
        modelId: ops.modelId,
        modelDeveloper: ops.modelDeveloper.toLocaleLowerCase(),
        maxTokens: ops.maxTokens,
        temperature: ops.temperature,
        isImageGeneration: ops.isImageGeneration,
        isWebSearch: ops.isWebSearch,
        promptId: ops.promptId,
        file,
      })
      .pipe(finalize(() => this.#setIsSending(false)))
      .subscribe({
        next: (r) => {
          this.#fileStore.clear();
          if (r.type === 'delta') this.#addAssistantMsg(r.data || '');
          if (r.type === 'done') {
            this.#setMessagesMetadata({
              inputTokens: r.data.inputTokens,
              outputTokens: r.data.outputTokens,
            });
            this.#handleNewChat(r);
            if (r.data.imageUrl) {
              this.#addAssistantMsg('', r.data.imageUrl);
            }
          }
        },
        error: (error) => {
          console.error('Message stream failed', error);
        },
      });
  }

  #handleNewChat({ data }: StreamDoneEvent): void {
    if (!this.#router.url.includes(data.chatId)) {
      this.#router.navigate(['/chat', data.chatId], { replaceUrl: true });
      this.#setCurrentChatId(data.chatId);
      this.#addUserChat({
        id: data.chatId,
        title: data.title,
        createdAt: new Date(),
      });
    }
  }

  #addAssistantMsg(message: string, imageUrl?: string): void {
    if (this.#messages()[this.#messages().length - 1]?.role !== 'assistant') {
      this.#addAssistantMessage(message);
      return;
    }
    this.#addAssistantChunk({
      content: message,
      imageUrl,
    });
  }
}
