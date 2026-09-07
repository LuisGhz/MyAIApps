import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessagesHandler } from '@chat/services/message-handler';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { MoreOptions } from '../more-options/more-options';
import { FilePreview } from '../file-preview/file-preview';
import { select, dispatch } from '@ngxs/store';
import { ChatStore } from '@st/chat/chat.store';
import { ChatActions } from '@st/chat/chat.actions';
import { EnabledOptions } from '../enabled-options/enabled-options';
import { Microphone } from '../microphone/microphone';

@Component({
  selector: 'app-input-message',
  imports: [
    FormsModule,
    NzInputModule,
    NzIconModule,
    MoreOptions,
    FilePreview,
    EnabledOptions,
    Microphone,
  ],
  templateUrl: './input-message.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMessage {
  readonly #messagesHandler = inject(MessagesHandler);
  readonly #dispatch = dispatch(ChatActions.SetMessageText);
  readonly file = select(ChatStore.getOps)().file;
  readonly currentChatId = select(ChatStore.getCurrentChatId);
  readonly messageText = select(ChatStore.getMessageText);
  readonly isTranscribing = select(ChatStore.isTranscribing);
  readonly isSending = select(ChatStore.isSending);
  @ViewChild(Microphone) microphone?: Microphone;

  onMessageTextChange(value: string): void {
    this.#dispatch(value);
  }

  onSend(): void {
    if (this.isTranscribing() || this.isSending() || this.microphone?.isRecording()) {
      return;
    }

    const trimmedMessage = this.messageText().trim();
    if (trimmedMessage) {
      this.#messagesHandler.handleUserMessage(trimmedMessage, this.currentChatId() ?? undefined);
      this.#dispatch('');
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }
}
