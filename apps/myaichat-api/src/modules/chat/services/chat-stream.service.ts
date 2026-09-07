import { Injectable } from '@nestjs/common';
import { Chat, Message, MessageRole } from '../entities';
import { User } from '@usr/entities';
import { ChatService } from './chat.service';
import { AIProviderRegistry } from './ai-provider-registry.service';
import { ImageUploadService } from '@s3/services';
import { EnvService } from '@cfg/schema/env.service';
import { PromptsService } from '@prompts/services';
import { ModelsService } from '@models/services';
import {
  StreamEventType,
  type ChatStreamEvent,
  type StreamDoneEvent,
} from '../dto';
import type {
  AIProvider,
  HandleStreamMessageParams,
  GetOrCreateChatParams,
  SaveMessagesParams,
} from '../interfaces';
import { Prompt } from '@prompts/entities';

@Injectable()
export class ChatStreamService {
  constructor(
    private readonly chatService: ChatService,
    private readonly aiProviderRegistry: AIProviderRegistry,
    private readonly imageUploadService: ImageUploadService,
    private readonly envService: EnvService,
    private readonly promptsService: PromptsService,
    private readonly modelsService: ModelsService,
  ) {}

  async handleStreamMessage(params: HandleStreamMessageParams): Promise<void> {
    const {
      chatId,
      promptId,
      message,
      modelId,
      maxTokens,
      temperature,
      fileKey,
      userId,
      provider,
      isImageGeneration,
      isWebSearch,
      onEvent,
    } = params;

    const aiProvider = this.aiProviderRegistry.getProvider(provider);

    const modelData = await this.modelsService.findOne(modelId);

    const chat = await this.#getOrCreateChat({
      chatId,
      promptId,
      userId,
      model: modelData.value,
      maxTokens,
      temperature,
      isImageGeneration,
      isWebSearch,
    });

    const isNewChat = !chatId;
    let fullContent = '';
    const messages = chat.messages ?? [];
    if (chat.prompt?.messages) {
      const promptMessages = chat.prompt.messages.map((msg) => ({
        role: msg.role as unknown as MessageRole,
        content: msg.content,
      }));
      messages.unshift(...(promptMessages as Message[]));
    }
    const result = await aiProvider.streamResponse(
      {
        previousMessages: messages,
        newMessage: message,
        model: chat.model,
        maxTokens: chat.maxTokens,
        temperature: chat.temperature,
        supportsTemperature: modelData.supportsTemperature,
        fileKey,
        isImageGeneration: isImageGeneration,
        isWebSearch: isWebSearch,
        systemPrompt: chat.prompt?.content || undefined,
        isReasoning: modelData.isReasoning,
        reasoningLevel: modelData.reasoningLevel || undefined,
      },
      (delta) => {
        fullContent += delta;
        onEvent({
          type: StreamEventType.DELTA,
          data: delta,
        });
      },
    );

    let uploadedImageKey: string | undefined;
    if (result.imageKey) {
      uploadedImageKey = await this.imageUploadService.uploadBase64Image(
        result.imageKey,
      );
    }

    await this.#saveMessages({
      chat,
      userMessage: message,
      assistantContent: fullContent,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      fileKey,
      imageKey: uploadedImageKey,
    });

    const title = isNewChat
      ? await this.#generateAndSaveTitle(
          aiProvider,
          chat.id,
          message,
          fullContent,
        )
      : undefined;

    this.#sendDoneEvent(onEvent, chat.id, result, title, uploadedImageKey);
  }

  async #getOrCreateChat(params: GetOrCreateChatParams): Promise<Chat> {
    const {
      chatId,
      promptId,
      userId,
      model,
      maxTokens,
      temperature,
      isImageGeneration,
      isWebSearch,
    } = params;

    if (chatId) return this.chatService.findChatByIdOrFail(chatId, userId);

    let prompt: Prompt | undefined;
    if (promptId)
      prompt = await this.promptsService.findOneForChat(promptId, userId);

    return this.chatService.createChat({
      user: { id: userId } as User,
      model,
      maxTokens,
      temperature,
      isImageGeneration,
      isWebSearch,
      prompt,
    });
  }
  async #saveMessages(params: SaveMessagesParams): Promise<void> {
    const {
      chat,
      userMessage,
      assistantContent,
      inputTokens,
      outputTokens,
      fileKey,
      imageKey,
    } = params;

    await this.chatService.saveMessage({
      chat,
      content: userMessage,
      role: MessageRole.USER,
      inputTokens,
      fileKey,
    });

    await this.chatService.saveMessage({
      chat,
      content: assistantContent,
      role: MessageRole.ASSISTANT,
      outputTokens,
      fileKey: imageKey,
    });
  }

  async #generateAndSaveTitle(
    aiProvider: AIProvider,
    chatId: string,
    userMessage: string,
    assistantContent: string,
  ): Promise<string> {
    const title = await aiProvider.generateTitle(userMessage, assistantContent);
    await this.chatService.updateChatTitle(chatId, title);
    return title;
  }

  #sendDoneEvent(
    onEvent: (event: ChatStreamEvent) => void,
    chatId: string,
    result: { inputTokens: number; outputTokens: number },
    title?: string,
    imageKey?: string,
  ): void {
    const doneEventData: StreamDoneEvent['data'] = {
      chatId,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      title,
      imageUrl: imageKey
        ? `${this.envService.cdnDomain}${imageKey}`
        : undefined,
    };

    onEvent({
      type: StreamEventType.DONE,
      data: doneEventData,
    });
  }
}
