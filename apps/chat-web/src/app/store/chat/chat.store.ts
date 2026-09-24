import { inject, Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ChatStoreModel } from './models/chat.store.model';
import { ChatActions } from './chat.actions';
import { FileStoreService } from './services';

@Injectable()
@State<ChatStoreModel>({
  name: 'chat',
  defaults: {
    messages: [],
    modelId: '',
    modelDeveloper: '',
    maxTokens: 2000,
    temperature: 0.5,
    file: undefined,
    currentChatId: null,
    isImageGeneration: false,
    isWebSearch: false,
    messageText: '',
    isTranscribing: false,
    isSending: false,
    promptId: undefined,
    hasMoreMessages: true,
    isLoadingOlderMessages: false,
  },
})
export class ChatStore {
  #fileStore = inject(FileStoreService);

  @Action(ChatActions.ResetChat)
  resetChat(ctx: StateContext<ChatStoreModel>) {
    ctx.setState({
      messages: [],
      modelId: '',
      modelDeveloper: '',
      maxTokens: 2000,
      temperature: 0.5,
      file: undefined,
      currentChatId: null,
      isImageGeneration: false,
      isWebSearch: false,
      messageText: '',
      isTranscribing: false,
      isSending: false,
      promptId: undefined,
      hasMoreMessages: true,
      isLoadingOlderMessages: false,
    });
    this.#fileStore.clear();
  }

  @Action(ChatActions.SetCurrentChatId)
  setCurrentChatId(ctx: StateContext<ChatStoreModel>, { payload }: ChatActions.SetCurrentChatId) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      currentChatId: payload,
    });
  }

  @Action(ChatActions.SetOps)
  setOps(ctx: StateContext<ChatStoreModel>, { payload }: ChatActions.SetOps) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      ...payload,
    });
  }

  @Action(ChatActions.AddUserMessage)
  addUserMessage(ctx: StateContext<ChatStoreModel>, { payload, file }: ChatActions.AddUserMessage) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      messages: [...state.messages, { role: 'user', content: payload, file }],
      hasMoreMessages: true,
    });
  }

  @Action(ChatActions.AddAssistantMessage)
  addAssistantMessage(
    ctx: StateContext<ChatStoreModel>,
    { payload }: ChatActions.AddAssistantMessage,
  ) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      messages: [...state.messages, { role: 'assistant', content: payload }],
    });
  }

  @Action(ChatActions.AddAssistantChunk)
  addAssistantChunk(ctx: StateContext<ChatStoreModel>, { payload }: ChatActions.AddAssistantChunk) {
    const state = ctx.getState();
    const messages = [...state.messages];
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      lastMessage.content += payload.content;
      if (payload.imageUrl) {
        lastMessage.file = payload.imageUrl;
      }
      messages[messages.length - 1] = lastMessage;
    }
    ctx.setState({
      ...state,
      messages,
    });
  }

  @Action(ChatActions.LoadMessages)
  loadMessages(ctx: StateContext<ChatStoreModel>, { payload }: ChatActions.LoadMessages) {
    ctx.setState({
      ...ctx.getState(),
      messages: payload.messages,
      maxTokens: payload.maxTokens,
      temperature: payload.temperature,
      hasMoreMessages: payload.hasMore,
    });
  }

  @Action(ChatActions.SetMessagesMetadata)
  setMessagesMetadata(
    ctx: StateContext<ChatStoreModel>,
    { payload }: ChatActions.SetMessagesMetadata,
  ) {
    const state = ctx.getState();
    const messages = [...state.messages];

    // Set inputTokens on last user message
    if (payload.inputTokens !== undefined) {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'user') {
          messages[i] = { ...messages[i], inputTokens: payload.inputTokens };
          break;
        }
      }
    }

    // Set outputTokens on last assistant message
    if (payload.outputTokens !== undefined) {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
          messages[i] = { ...messages[i], outputTokens: payload.outputTokens };
          break;
        }
      }
    }

    ctx.setState({
      ...state,
      messages,
    });
  }

  @Action(ChatActions.RemoveFile)
  removeFile(ctx: StateContext<ChatStoreModel>) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      file: undefined,
    });
  }

  @Action(ChatActions.EnableImageGeneration)
  enableImageGeneration(ctx: StateContext<ChatStoreModel>) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      isImageGeneration: true,
      isWebSearch: false,
    });
  }

  @Action(ChatActions.DisableImageGeneration)
  disableImageGeneration(ctx: StateContext<ChatStoreModel>) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      isImageGeneration: false,
    });
  }

  @Action(ChatActions.EnableWebSearch)
  enableWebSearch(ctx: StateContext<ChatStoreModel>) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      isWebSearch: true,
      isImageGeneration: false,
    });
  }

  @Action(ChatActions.DisableWebSearch)
  disableWebSearch(ctx: StateContext<ChatStoreModel>) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      isWebSearch: false,
    });
  }

  @Action(ChatActions.SetMessageText)
  setMessageText(ctx: StateContext<ChatStoreModel>, { payload }: ChatActions.SetMessageText) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      messageText: payload,
    });
  }

  @Action(ChatActions.SetIsTranscribing)
  setIsTranscribing(ctx: StateContext<ChatStoreModel>, { payload }: ChatActions.SetIsTranscribing) {
    ctx.patchState({ isTranscribing: payload });
  }

  @Action(ChatActions.SetIsSending)
  setIsSending(ctx: StateContext<ChatStoreModel>, { payload }: ChatActions.SetIsSending) {
    ctx.patchState({ isSending: payload });
  }

  @Action(ChatActions.PrependMessages)
  prependMessages(ctx: StateContext<ChatStoreModel>, { payload }: ChatActions.PrependMessages) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      messages: [...payload.messages, ...state.messages],
      hasMoreMessages: payload.hasMore,
    });
  }

  @Action(ChatActions.SetIsLoadingOlderMessages)
  setIsLoadingOlderMessages(
    ctx: StateContext<ChatStoreModel>,
    { payload }: ChatActions.SetIsLoadingOlderMessages,
  ) {
    ctx.patchState({ isLoadingOlderMessages: payload });
  }

  @Selector()
  static getOps(state: ChatStoreModel) {
    return {
      modelId: state.modelId,
      modelDeveloper: state.modelDeveloper,
      maxTokens: state.maxTokens,
      temperature: state.temperature,
      file: state.file,
      isImageGeneration: state.isImageGeneration,
      isWebSearch: state.isWebSearch,
      promptId: state.promptId,
    };
  }

  @Selector()
  static getMessages(state: ChatStoreModel) {
    return state.messages;
  }

  @Selector()
  static getCurrentChatId(state: ChatStoreModel) {
    return state.currentChatId;
  }

  @Selector()
  static isImageGeneration(state: ChatStoreModel) {
    return state.isImageGeneration;
  }

  @Selector()
  static isWebSearch(state: ChatStoreModel) {
    return state.isWebSearch;
  }

  @Selector()
  static getMessageText(state: ChatStoreModel) {
    return state.messageText;
  }

  @Selector()
  static isTranscribing(state: ChatStoreModel) {
    return state.isTranscribing;
  }

  @Selector()
  static isSending(state: ChatStoreModel) {
    return state.isSending;
  }

  @Selector()
  static hasMoreMessages(state: ChatStoreModel) {
    return state.hasMoreMessages;
  }

  @Selector()
  static isLoadingOlderMessages(state: ChatStoreModel) {
    return state.isLoadingOlderMessages;
  }
}
