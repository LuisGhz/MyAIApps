import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat, Message, MessageRole } from '../entities';
import { User } from '@usr/entities';
import { Prompt } from '@prompts/entities';
import {
  ChatMessagesResDto,
  UpdateAIFeaturesReqDto,
  UserChatsResDto,
} from '../dto';
import { EnvService } from '@cfg/schema/env.service';
import { S3Service } from '@s3/services';

export interface CreateChatData {
  user: User;
  model: string;
  maxTokens: number;
  temperature: number;
  isImageGeneration?: boolean;
  isWebSearch?: boolean;
  prompt?: Prompt;
}

export interface SaveMessageData {
  chat: Chat;
  content: string;
  role: MessageRole;
  inputTokens?: number;
  outputTokens?: number;
  fileKey?: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly envService: EnvService,
    private readonly s3Service: S3Service,
  ) {}

  async createChat(data: CreateChatData): Promise<Chat> {
    const chat = this.chatRepository.create({
      user: data.user,
      model: data.model,
      maxTokens: data.maxTokens,
      temperature: data.temperature,
      isImageGeneration: data.isImageGeneration ?? false,
      isWebSearch: data.isWebSearch ?? false,
      prompt: data.prompt,
    });

    return this.chatRepository.save(chat);
  }

  async findChatById(id: string, userId: string): Promise<Chat | null> {
    return this.chatRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'messages', 'prompt', 'prompt.messages'],
      order: {
        messages: { createdAt: 'ASC' },
        prompt: { messages: { createdAt: 'ASC' } },
      },
    });
  }

  async findChatByIdOrFail(id: string, userId: string): Promise<Chat> {
    const chat = await this.findChatById(id, userId);

    if (!chat) {
      this.logger.error(`Chat with id ${id} not found for user ${userId}`);
      throw new NotFoundException(`Chat with id ${id} not found`);
    }

    return chat;
  }

  async saveMessage(data: SaveMessageData): Promise<Message> {
    const message = this.messageRepository.create({
      chat: data.chat,
      content: data.content,
      role: data.role,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      fileKey: data.fileKey,
    });

    return this.messageRepository.save(message);
  }

  async updateChatTitle(chatId: string, title: string): Promise<void> {
    await this.chatRepository.update(chatId, { title });
  }

  async updateAIFeatures(
    chatId: string,
    { isImageGeneration, isWebSearch }: UpdateAIFeaturesReqDto,
  ): Promise<void> {
    // Validate that both are not true at the same time
    if (isWebSearch && isImageGeneration)
      throw new BadRequestException(
        'Cannot enable both web search and image generation at the same time',
      );

    await this.chatRepository.update(chatId, {
      isImageGeneration,
      isWebSearch,
    });
  }

  async updateChatMaxTokens(chatId: string, maxTokens: number): Promise<void> {
    await this.chatRepository.update(chatId, { maxTokens });
  }

  async updateChatTemperature(
    chatId: string,
    temperature: number,
  ): Promise<void> {
    await this.chatRepository.update(chatId, { temperature });
  }

  async getChatMessages(
    chatId: string,
    userId: string,
    beforeMessageId?: string,
  ): Promise<ChatMessagesResDto> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, user: { id: userId } },
      select: [
        'id',
        'maxTokens',
        'temperature',
        'isImageGeneration',
        'isWebSearch',
      ],
    });

    if (!chat) {
      this.logger.error(`Chat with id ${chatId} not found for user ${userId}`);
      throw new NotFoundException(
        `Chat with id ${chatId} not found for user ${userId}`,
      );
    }

    const pageSize = 20;
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId })
      .select([
        'message.id',
        'message.content',
        'message.role',
        'message.createdAt',
        'message.inputTokens',
        'message.outputTokens',
        'message.fileKey',
      ])
      .orderBy('message.createdAt', 'DESC')
      .take(pageSize + 1);

    if (beforeMessageId) {
      const beforeMessage = await this.messageRepository.findOne({
        where: { id: beforeMessageId, chat: { id: chatId } },
        select: ['id', 'createdAt'],
      });

      if (beforeMessage)
        queryBuilder.andWhere('message.createdAt < :beforeDate', {
          beforeDate: beforeMessage.createdAt,
        });
    }

    const messages = await queryBuilder.getMany();
    const hasMore = messages.length > pageSize;
    const paginatedMessages = hasMore ? messages.slice(0, pageSize) : messages;

    return {
      messages: paginatedMessages.toReversed().map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role,
        createdAt: m.createdAt,
        inputTokens: m.inputTokens,
        outputTokens: m.outputTokens,
        file: m.fileKey
          ? `${this.envService.cdnDomain}${m.fileKey}`
          : undefined,
      })),
      hasMore,
      maxTokens: chat.maxTokens,
      temperature: chat.temperature,
      isWebSearch: chat.isWebSearch,
      isImageGeneration: chat.isImageGeneration,
    };
  }

  async getUserChats(userId: string): Promise<UserChatsResDto[]> {
    return this.chatRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      select: ['id', 'title', 'createdAt'],
    });
  }

  async hasMessages(chatId: string): Promise<boolean> {
    const count = await this.messageRepository.count({
      where: { chat: { id: chatId } },
    });
    return count > 0;
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    const chat = await this.findChatByIdOrFail(chatId, userId);

    const fileKeys = chat.messages
      .map((m) => m.fileKey)
      .filter((key): key is string => !!key);

    if (fileKeys.length > 0) {
      await this.s3Service.deleteFiles(fileKeys);
    }

    await this.chatRepository.remove(chat);
  }
}
