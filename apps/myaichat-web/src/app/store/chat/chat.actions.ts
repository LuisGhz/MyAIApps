import { AssistantMessageChunk, ChatStoreOps, Message } from './models';

export namespace ChatActions {
  const preffix = '[Chat]';

  export class ResetChat {
    static readonly type = `${preffix} Reset Chat`;
  }

  export class SetOps {
    static readonly type = `${preffix} Set Ops`;
    constructor(public payload: ChatStoreOps) {}
  }

  export class RemoveFile {
    static readonly type = `${preffix} Remove File`;
  }

  export class LoadMessages {
    static readonly type = `${preffix} Load Messages`;
    constructor(
      public payload: { messages: Message[]; maxTokens: number; temperature: number; hasMore: boolean },
    ) {}
  }

  export class AddUserMessage {
    static readonly type = `${preffix} Add User Message`;
    constructor(
      public payload: string,
      public file?: File | string,
    ) {}
  }

  export class AddAssistantMessage {
    static readonly type = `${preffix} Add Assistant Message`;
    constructor(public payload: string) {}
  }

  export class AddAssistantChunk {
    static readonly type = `${preffix} Add Assistant Chunk`;
    constructor(public payload: AssistantMessageChunk) {}
  }

  export class SetMessagesMetadata {
    static readonly type = `${preffix} Set Messages Metadata`;
    constructor(public payload: { inputTokens?: number; outputTokens?: number }) {}
  }

  export class SetCurrentChatId {
    static readonly type = `${preffix} Set Current Chat Id`;
    constructor(public payload: string | null) {}
  }

  export class EnableImageGeneration {
    static readonly type = `${preffix} Enable Image Generation`;
  }

  export class DisableImageGeneration {
    static readonly type = `${preffix} Disable Image Generation`;
  }

  export class EnableWebSearch {
    static readonly type = `${preffix} Enable Web Search`;
  }

  export class DisableWebSearch {
    static readonly type = `${preffix} Disable Web Search`;
  }

  export class SetMessageText {
    static readonly type = `${preffix} Set Message Text`;
    constructor(public payload: string) {}
  }

  export class SetIsTranscribing {
    static readonly type = `${preffix} Set Is Transcribing`;
    constructor(public payload: boolean) {}
  }

  export class SetIsSending {
    static readonly type = `${preffix} Set Is Sending`;
    constructor(public payload: boolean) {}
  }

  export class PrependMessages {
    static readonly type = `${preffix} Prepend Messages`;
    constructor(public payload: { messages: Message[]; hasMore: boolean }) {}
  }

  export class SetIsLoadingOlderMessages {
    static readonly type = `${preffix} Set Is Loading Older Messages`;
    constructor(public payload: boolean) {}
  }
}
