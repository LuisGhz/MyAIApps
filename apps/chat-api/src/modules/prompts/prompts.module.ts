import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from '@chat/entities';
import { Prompt, PromptMessage } from './entities';
import { PromptsService } from './services';
import { PromptsController } from './prompts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Prompt, PromptMessage, Chat])],
  controllers: [PromptsController],
  providers: [PromptsService],
  exports: [PromptsService],
})
export class PromptsModule {}
