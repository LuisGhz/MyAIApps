import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt, PromptMessage } from '../entities';
import { Chat } from '@chat/entities';
import { User } from '@usr/entities';
import {
  CreatePromptReqDto,
  CreatePromptResDto,
  UpdatePromptReqDto,
  UpdatePromptResDto,
  PromptResDto,
  PromptListItemResDto,
  PromptListItemSummaryResDto,
} from '../dto';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private readonly promptRepository: Repository<Prompt>,
    @InjectRepository(PromptMessage)
    private readonly promptMessageRepository: Repository<PromptMessage>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async create(
    dto: CreatePromptReqDto,
    userId: string,
  ): Promise<CreatePromptResDto> {
    const prompt = this.promptRepository.create({
      name: dto.name,
      content: dto.content,
      user: { id: userId } as User,
      messages: dto.messages?.map((msg) =>
        this.promptMessageRepository.create({
          role: msg.role,
          content: msg.content,
        }),
      ),
    });

    const savedPrompt = await this.promptRepository.save(prompt);

    return this.mapToResponseDto(savedPrompt);
  }

  async findAll(userId: string): Promise<PromptListItemResDto[]> {
    const prompts = await this.promptRepository.find({
      where: { user: { id: userId } },
      relations: ['messages'],
      order: { updatedAt: 'DESC' },
    });

    return prompts.map((prompt) => ({
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      messageCount: prompt.messages?.length ?? 0,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
    }));
  }

  async findAllSummary(userId: string): Promise<PromptListItemSummaryResDto[]> {
    const prompts = await this.promptRepository.find({
      where: { user: { id: userId } },
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });

    return prompts.map((prompt) => ({
      id: prompt.id,
      name: prompt.name,
    }));
  }

  async findOne(id: string, userId: string): Promise<PromptResDto> {
    const prompt = await this.findByIdOrFail(id, userId);

    return this.mapToResponseDto(prompt);
  }

  async findOneForChat(id: string, userId: string): Promise<Prompt> {
    const prompt = await this.promptRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['messages'],
      order: { messages: { createdAt: 'ASC' } },
    });

    if (!prompt) throw new NotFoundException(`Prompt with id ${id} not found`);

    return prompt;
  }

  async update(
    id: string,
    dto: UpdatePromptReqDto,
    userId: string,
  ): Promise<UpdatePromptResDto> {
    const prompt = await this.findByIdOrFail(id, userId);

    if (dto.name !== undefined) {
      prompt.name = dto.name;
    }

    if (dto.content !== undefined) {
      prompt.content = dto.content;
    }

    if (dto.messages !== undefined) {
      // Remove existing messages that are not in the update
      const existingMessageIds = prompt.messages.map((m) => m.id);
      const updatedMessageIds = new Set(
        dto.messages.filter((m) => m.id).map((m) => m.id),
      );
      const messagesToDelete = existingMessageIds.filter(
        (id) => !updatedMessageIds.has(id),
      );

      if (messagesToDelete.length > 0) {
        await this.promptMessageRepository.delete(messagesToDelete);
      }

      // Update existing messages and create new ones
      const updatedMessages: PromptMessage[] = [];

      for (const msgDto of dto.messages) {
        if (msgDto.id) {
          // Update existing message
          const existingMessage = prompt.messages.find(
            (m) => m.id === msgDto.id,
          );

          if (existingMessage) {
            existingMessage.role = msgDto.role;
            existingMessage.content = msgDto.content;
            updatedMessages.push(existingMessage);
          }
        } else {
          // Create new message
          const newMessage = this.promptMessageRepository.create({
            role: msgDto.role,
            content: msgDto.content,
            prompt,
          });
          updatedMessages.push(newMessage);
        }
      }

      prompt.messages = updatedMessages;
    }

    const savedPrompt = await this.promptRepository.save(prompt);

    return this.mapToResponseDto(savedPrompt);
  }

  async remove(id: string, userId: string): Promise<void> {
    const prompt = await this.findByIdOrFail(id, userId);

    // Check if any chats are using this prompt
    const chatsUsingPrompt = await this.chatRepository.count({
      where: { prompt: { id } },
    });

    if (chatsUsingPrompt > 0) {
      throw new BadRequestException(
        `Cannot delete prompt. It is currently being used by ${chatsUsingPrompt} chat(s).`,
      );
    }

    await this.promptRepository.remove(prompt);
  }

  async deleteMessage(
    id: string,
    msgId: string,
    userId: string,
  ): Promise<void> {
    const prompt = await this.findByIdOrFail(id, userId);

    const message = prompt.messages.find((msg) => msg.id === msgId);
    if (!message) {
      throw new NotFoundException(
        `Message with id ${msgId} not found in prompt ${id}`,
      );
    }

    await this.promptMessageRepository.remove(message);
  }

  private async findByIdOrFail(id: string, userId: string): Promise<Prompt> {
    const prompt = await this.promptRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['messages', 'user'],
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with id ${id} not found`);
    }

    return prompt;
  }

  private mapToResponseDto(prompt: Prompt): PromptResDto {
    return {
      id: prompt.id,
      name: prompt.name,
      content: prompt.content,
      messages:
        prompt.messages?.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        })) ?? [],
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
    };
  }
}
