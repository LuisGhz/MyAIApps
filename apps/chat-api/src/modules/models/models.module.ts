import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model, ModelDeveloper } from './entities';
import { ModelsService, ModelSeedService } from './services';
import { ModelsController } from './models.controller';
import { IsValidModelConstraint, IsValidModelIdConstraint } from './validators';

@Module({
  imports: [TypeOrmModule.forFeature([Model, ModelDeveloper])],
  controllers: [ModelsController],
  providers: [
    ModelsService,
    ModelSeedService,
    IsValidModelConstraint,
    IsValidModelIdConstraint,
  ],
  exports: [ModelsService, IsValidModelConstraint, IsValidModelIdConstraint],
})
export class ModelsModule {}
