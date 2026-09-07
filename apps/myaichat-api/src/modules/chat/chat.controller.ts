import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CurrentUser } from '@cmn/decorators';
import type { JwtPayload } from '@cmn/interfaces';
import { GuestModelAccessGuard } from '@cmn/guards';
import { S3Service } from '@s3/services';
import { IsValidFileTypeConstraint } from '@s3/validators';
import {
  ChatService,
  ChatStreamService,
  TranscriptionService,
} from './services';
import { IsValidAudioTypeConstraint } from './validators';
import {
  ChatMessagesReqDto,
  ChatMessagesResDto,
  RenameChatReqDto,
  SendMessageReqDto,
  StreamEventType,
  UpdateAIFeaturesReqDto,
  UpdateMaxTokensReqDto,
  UpdateTemperatureReqDto,
  TranscribeAudioReqDto,
  TranscribeAudioResDto,
  type ChatStreamEvent,
} from './dto';
import type { HandleStreamRequestParams } from './interfaces';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly chatStreamService: ChatStreamService,
    private readonly transcriptionService: TranscriptionService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all user chats' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of user chats',
  })
  async getUserChats(@CurrentUser() user: JwtPayload) {
    return this.chatService.getUserChats(user.sub);
  }

  @Post('send-message')
  @UseGuards(GuestModelAccessGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Send a message and get AI response (SSE stream)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SendMessageReqDto })
  @ApiResponse({
    status: 200,
    description: 'Returns Server-Sent Events stream with AI response',
  })
  async sendMessageOpenAI(
    @Body() dto: SendMessageReqDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    let fileKey: string | undefined;

    if (file) {
      this.#validateFile(file);
      fileKey = await this.s3Service.uploadFile(file);
    }

    await this.#handleStreamRequest({
      res,
      dto,
      userId: user.sub,
      provider: dto.modelDeveloper,
      fileKey,
      isImageGeneration: dto.isImageGeneration,
      isWebSearch: dto.isWebSearch,
    });
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get chat messages' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns chat messages',
    type: ChatMessagesResDto,
  })
  async getChatMessages(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Query() dto: ChatMessagesReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ChatMessagesResDto> {
    return this.chatService.getChatMessages(
      chatId,
      user.sub,
      dto.beforeMessageId,
    );
  }

  @Patch(':id/rename')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Rename a chat' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({
    status: 204,
    description: 'Chat renamed successfully',
  })
  async renameChat(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() dto: RenameChatReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.chatService.findChatByIdOrFail(chatId, user.sub);
    await this.chatService.updateChatTitle(chatId, dto.title);
  }

  @Patch(':id/update-ai-features')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update AI features for a chat' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({
    status: 204,
    description: 'AI features updated successfully',
  })
  async updateAIFeatures(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() dto: UpdateAIFeaturesReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.chatService.findChatByIdOrFail(chatId, user.sub);
    await this.chatService.updateAIFeatures(chatId, dto);
  }

  @Patch(':id/update-max-tokens')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update max tokens for a chat' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({
    status: 204,
    description: 'Max tokens updated successfully',
  })
  async updateMaxTokens(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() dto: UpdateMaxTokensReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.chatService.findChatByIdOrFail(chatId, user.sub);
    await this.chatService.updateChatMaxTokens(chatId, dto.maxTokens);
  }

  @Patch(':id/update-temperature')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update temperature for a chat' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({
    status: 204,
    description: 'Temperature updated successfully',
  })
  async updateTemperature(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() dto: UpdateTemperatureReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.chatService.findChatByIdOrFail(chatId, user.sub);
    await this.chatService.updateChatTemperature(chatId, dto.temperature);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a chat' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({
    status: 204,
    description: 'Chat deleted successfully',
  })
  async deleteChat(
    @Param('id', ParseUUIDPipe) chatId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.chatService.deleteChat(chatId, user.sub);
  }

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  @ApiOperation({ summary: 'Transcribe audio file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: { type: 'string', format: 'binary' },
        temperature: { type: 'number', minimum: 0, maximum: 1, default: 0 },
      },
      required: ['audio'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns transcribed text',
    type: TranscribeAudioResDto,
  })
  async transcribeAudio(
    @UploadedFile() audio: Express.Multer.File | undefined,
    @Body() dto: TranscribeAudioReqDto,
    @CurrentUser() _user: JwtPayload,
  ): Promise<TranscribeAudioResDto> {
    if (!audio) throw new BadRequestException('Audio file is required');

    this.#validateAudioFile(audio);
    return this.transcriptionService.transcribeAudio(audio, dto.temperature);
  }

  #validateFile(file: Express.Multer.File): void {
    const validator = new IsValidFileTypeConstraint();
    if (!validator.validate(file))
      throw new BadRequestException(validator.defaultMessage());
  }

  #validateAudioFile(file: Express.Multer.File): void {
    const validator = new IsValidAudioTypeConstraint();
    if (!validator.validate(file))
      throw new BadRequestException(validator.defaultMessage());
  }

  #setSSEHeaders(res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
  }

  #sendSSEEvent(res: Response, event: ChatStreamEvent): void {
    res.write(`${JSON.stringify(event)}\n\n`);
  }

  async #handleStreamRequest({
    res,
    dto,
    userId,
    provider,
    fileKey,
    isImageGeneration,
    isWebSearch,
  }: HandleStreamRequestParams): Promise<void> {
    this.#setSSEHeaders(res);

    try {
      await this.chatStreamService.handleStreamMessage({
        chatId: dto.chatId,
        promptId: dto.promptId,
        message: dto.message,
        modelId: dto.modelId,
        maxTokens: dto.maxTokens,
        temperature: dto.temperature,
        userId,
        provider,
        fileKey,
        isImageGeneration,
        isWebSearch,
        onEvent: (event: ChatStreamEvent) => this.#sendSSEEvent(res, event),
      });

      res.end();
    } catch (error) {
      this.logger.error('Error in chat stream', error);
      this.#sendSSEEvent(res, {
        type: StreamEventType.ERROR,
        data: {
          message: error instanceof Error ? error.message : 'An error occurred',
          code: 'STREAM_ERROR',
        },
      });
      res.end();
    }
  }
}
