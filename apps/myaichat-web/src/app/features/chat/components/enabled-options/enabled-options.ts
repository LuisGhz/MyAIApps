import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ChatApi } from '@chat/services/chat-api';
import { dispatch, select } from '@ngxs/store';
import { ChatActions } from '@st/chat/chat.actions';
import { ChatStore } from '@st/chat/chat.store';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-enabled-options',
  imports: [NzIconModule],
  templateUrl: './enabled-options.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnabledOptions {
  readonly #chatApi = inject(ChatApi);
  readonly #currentChatId = select(ChatStore.getCurrentChatId);
  readonly isImageGeneration = select(ChatStore.isImageGeneration);
  readonly isWebSearch = select(ChatStore.isWebSearch);
  readonly #disableImageGeneration = dispatch(ChatActions.DisableImageGeneration);
  readonly #disableWebSearch = dispatch(ChatActions.DisableWebSearch);
  isImageGenerationHovered = signal(false);
  isWebSearchHovered = signal(false);

  closeImageGeneration(): void {
    this.isImageGenerationHovered.set(false);
    this.#disableImageGeneration();
    this.#updateAIFeaturesIfHasChatId();
  }

  closeWebSearch(): void {
    this.isWebSearchHovered.set(false);
    this.#disableWebSearch();
    this.#updateAIFeaturesIfHasChatId();
  }

  #updateAIFeaturesIfHasChatId(): void {
    if (this.#currentChatId())
      this.#chatApi.updateAIFeatures(this.#currentChatId()!, {
        isImageGeneration: false,
        isWebSearch: false,
      });
  }
}
