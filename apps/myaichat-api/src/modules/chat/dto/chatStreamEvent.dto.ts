export enum StreamEventType {
  DELTA = 'delta',
  ERROR = 'error',
  DONE = 'done',
}

export interface StreamDeltaEvent {
  type: StreamEventType.DELTA;
  data: string;
}

export interface StreamErrorEvent {
  type: StreamEventType.ERROR;
  data: {
    message: string;
    code?: string;
  };
}

export interface StreamDoneEvent {
  type: StreamEventType.DONE;
  data: {
    chatId: string;
    inputTokens: number;
    outputTokens: number;
    title?: string;
    imageUrl?: string;
  };
}

export type ChatStreamEvent =
  | StreamDeltaEvent
  | StreamErrorEvent
  | StreamDoneEvent;
