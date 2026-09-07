import { Module } from '@nestjs/common';
import { PhrasalVerbsController } from './phrasal-verbs.controller';
import { PhrasalVerbsService } from './services';

@Module({
  controllers: [PhrasalVerbsController],
  providers: [PhrasalVerbsService],
})
export class PhrasalVerbsModule {}
