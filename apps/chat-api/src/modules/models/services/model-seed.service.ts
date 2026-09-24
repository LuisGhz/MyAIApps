import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Model, ModelDeveloper } from '../entities';
import { MODELS } from '../models';

@Injectable()
export class ModelSeedService implements OnModuleInit {
  private readonly logger = new Logger(ModelSeedService.name);

  constructor(
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
    @InjectRepository(ModelDeveloper)
    private readonly developerRepository: Repository<ModelDeveloper>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedModels();
  }

  private async seedModels(): Promise<void> {
    // Check if the models table exists
    const tableExists = await this.checkTableExists('models');

    if (!tableExists) {
      this.logger.warn('Models table does not exist, skipping seed...');
      return;
    }

    // Check if there are any records
    const count = await this.modelRepository.count();

    if (count > 0) {
      this.logger.log('Models already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding models...');

    // Group models by developer
    const developerMap = new Map<
      string,
      (typeof MODELS)[number]['developBy']
    >();

    for (const modelInfo of MODELS) {
      if (!developerMap.has(modelInfo.developBy.name)) {
        developerMap.set(modelInfo.developBy.name, modelInfo.developBy);
      }
    }

    // Create or get developers
    const developers = new Map<string, ModelDeveloper>();

    for (const [name, devInfo] of developerMap) {
      let developer = await this.developerRepository.findOne({
        where: { name },
      });

      if (!developer) {
        developer = this.developerRepository.create({
          name: devInfo.name,
          link: devInfo.link,
          imageUrl: devInfo.imageUrl,
        });
        developer = await this.developerRepository.save(developer);
      }

      developers.set(name, developer);
    }

    // Create models
    const modelsToCreate: Partial<Model>[] = [];

    for (const modelInfo of MODELS) {
      const developer = developers.get(modelInfo.developBy.name);

      if (!developer) {
        this.logger.warn(
          `Developer ${modelInfo.developBy.name} not found, skipping model ${modelInfo.name}`,
        );
        continue;
      }

      modelsToCreate.push({
        name: modelInfo.name,
        shortName: modelInfo.shortName,
        value: modelInfo.value,
        link: modelInfo.link,
        priceInput: modelInfo.price.input,
        priceOutput: modelInfo.price.output,
        contextWindow: modelInfo.metadata.contextWindow,
        maxOutputTokens: modelInfo.metadata.maxOutputTokens,
        knowledgeCutoff: modelInfo.metadata.knowledgeCutoff,
        developer,
      });
    }

    await this.modelRepository.save(modelsToCreate);

    this.logger.log(
      `Models seeded successfully: ${modelsToCreate.length} models created`,
    );
  }

  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [tableName],
      );

      return result[0]?.exists ?? false;
    } catch {
      return false;
    }
  }
}
