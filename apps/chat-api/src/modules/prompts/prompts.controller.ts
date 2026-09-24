import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser } from '@cmn/decorators';
import type { JwtPayload } from '@cmn/interfaces';
import { PromptsService } from './services';
import {
  CreatePromptReqDto,
  CreatePromptResDto,
  UpdatePromptReqDto,
  UpdatePromptResDto,
  PromptResDto,
  PromptListItemResDto,
  PromptListItemSummaryResDto,
} from './dto';

@ApiTags('prompts')
@ApiBearerAuth()
@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prompt' })
  @ApiResponse({
    status: 201,
    description: 'Prompt created successfully',
    type: CreatePromptResDto,
  })
  async create(
    @Body() dto: CreatePromptReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CreatePromptResDto> {
    return this.promptsService.create(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prompts for current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of prompts',
    type: [PromptListItemResDto],
  })
  async findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<PromptListItemResDto[]> {
    return this.promptsService.findAll(user.sub);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get summary of all prompts (ID and name only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of prompt summaries',
    type: [PromptListItemSummaryResDto],
  })
  async findAllSummary(
    @CurrentUser() user: JwtPayload,
  ): Promise<PromptListItemSummaryResDto[]> {
    return this.promptsService.findAllSummary(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific prompt by ID' })
  @ApiParam({ name: 'id', description: 'Prompt ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns prompt details',
    type: PromptResDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<PromptResDto> {
    return this.promptsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a prompt' })
  @ApiParam({ name: 'id', description: 'Prompt ID' })
  @ApiResponse({
    status: 200,
    description: 'Prompt updated successfully',
    type: UpdatePromptResDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePromptReqDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UpdatePromptResDto> {
    return this.promptsService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a prompt' })
  @ApiParam({ name: 'id', description: 'Prompt ID' })
  @ApiResponse({
    status: 204,
    description: 'Prompt deleted successfully',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.promptsService.remove(id, user.sub);
  }

  @Delete(':id/messages/:msgId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message from a prompt' })
  @ApiParam({ name: 'id', description: 'Prompt ID' })
  @ApiParam({ name: 'msgId', description: 'Message ID' })
  @ApiResponse({
    status: 204,
    description: 'Message deleted successfully',
  })
  async deleteMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('msgId', ParseUUIDPipe) msgId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.promptsService.deleteMessage(id, msgId, user.sub);
  }
}
