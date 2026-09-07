import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model, ModelDeveloper } from '../entities';
import {
  CreateModelReqDto,
  CreateModelResDto,
  UpdateModelReqDto,
  UpdateModelResDto,
  ModelResDto,
  ModelListItemResDto,
} from '../dto';
import { AppCacheService } from '@cmn/services/app-cache.service';
import { CACHE_KEYS } from '@cmn/consts/cache.const';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
    @InjectRepository(ModelDeveloper)
    private readonly developerRepository: Repository<ModelDeveloper>,
    private readonly appCacheService: AppCacheService,
  ) {}

  async create(dto: CreateModelReqDto): Promise<CreateModelResDto> {
    let developer: ModelDeveloper;

    if (dto.developerId) {
      const foundDeveloper = await this.developerRepository.findOne({
        where: { id: dto.developerId },
      });

      if (!foundDeveloper) {
        throw new NotFoundException(
          `Developer with id ${dto.developerId} not found`,
        );
      }

      developer = foundDeveloper;
    } else if (dto.developer) {
      let existingDeveloper = await this.developerRepository.findOne({
        where: { name: dto.developer.name },
      });

      if (!existingDeveloper) {
        existingDeveloper = this.developerRepository.create({
          name: dto.developer.name,
          link: dto.developer.link,
          imageUrl: dto.developer.imageUrl,
        });
        existingDeveloper =
          await this.developerRepository.save(existingDeveloper);
      }

      developer = existingDeveloper;
    } else {
      throw new BadRequestException(
        'Either developerId or developer must be provided',
      );
    }

    const model = this.modelRepository.create({
      name: dto.name,
      shortName: dto.shortName,
      value: dto.value,
      link: dto.link,
      guestAccess: dto.guestAccess ?? false,
      priceInput: dto.price.input,
      priceOutput: dto.price.output,
      supportsTemperature: dto.supportsTemperature,
      contextWindow: dto.metadata.contextWindow,
      maxOutputTokens: dto.metadata.maxOutputTokens,
      knowledgeCutoff: dto.metadata.knowledgeCutoff,
      developer,
    });

    const savedModel = await this.modelRepository.save(model);

    await this.#invalidateFindAllCache();

    return this.mapToResponseDto(savedModel);
  }

  async findAll(): Promise<ModelListItemResDto[]> {
    const cachedData = await this.appCacheService.get<ModelListItemResDto[]>(
      CACHE_KEYS.MODELS_FIND_ALL,
    );

    if (cachedData) return cachedData;

    const models = await this.modelRepository.find({
      relations: ['developer'],
      order: { name: 'ASC' },
    });

    const data = models.map((model) => ({
      id: model.id,
      name: model.name,
      shortName: model.shortName,
      value: model.value,
      guestAccess: model.guestAccess,
      developer: {
        name: model.developer.name,
        imageUrl: model.developer.imageUrl,
      },
    }));

    this.appCacheService.setLong(CACHE_KEYS.MODELS_FIND_ALL, data);

    return data;
  }

  async findOne(id: string): Promise<ModelResDto> {
    const model = await this.findByIdOrFail(id);
    return this.mapToResponseDto(model);
  }

  async findByValue(value: string): Promise<ModelResDto> {
    const cachedData = await this.appCacheService.get<ModelResDto>(
      `${CACHE_KEYS.GET_BY_VALUE}:${value}`,
    );
    if (cachedData) return cachedData;

    const model = await this.modelRepository.findOne({
      where: { value },
      relations: ['developer'],
    });

    if (!model) {
      throw new NotFoundException(`Model with value "${value}" not found`);
    }

    const responseDto = this.mapToResponseDto(model);

    this.appCacheService.setLong(
      `${CACHE_KEYS.GET_BY_VALUE}:${value}`,
      responseDto,
    );

    return responseDto;
  }

  async update(id: string, dto: UpdateModelReqDto): Promise<UpdateModelResDto> {
    const model = await this.findByIdOrFail(id);
    const modelValue = model.value;
    await this.deleteCacheByValueIfApplicable(modelValue);

    this.#updateBasicFields(model, dto);
    this.#updatePricing(model, dto);
    this.#updateMetadata(model, dto);
    await this.#updateDeveloper(model, dto);

    const savedModel = await this.modelRepository.save(model);

    await this.#invalidateFindAllCache();

    return this.mapToResponseDto(savedModel);
  }

  #updateBasicFields(model: Model, dto: UpdateModelReqDto): void {
    if (dto.name !== undefined) model.name = dto.name;
    if (dto.shortName !== undefined) model.shortName = dto.shortName;
    if (dto.value !== undefined) model.value = dto.value;
    if (dto.link !== undefined) model.link = dto.link;
    if (dto.guestAccess !== undefined) model.guestAccess = dto.guestAccess;
    if (dto.supportsTemperature !== undefined)
      model.supportsTemperature = dto.supportsTemperature;
    if (dto.isReasoning !== undefined) model.isReasoning = dto.isReasoning;
    if (dto.reasoningLevel !== undefined)
      model.reasoningLevel = dto.reasoningLevel;
  }

  #updatePricing(model: Model, dto: UpdateModelReqDto): void {
    if (!dto.price) return;
    if (dto.price.input !== undefined) model.priceInput = dto.price.input;
    if (dto.price.output !== undefined) model.priceOutput = dto.price.output;
  }

  #updateMetadata(model: Model, dto: UpdateModelReqDto): void {
    if (!dto.metadata) return;
    if (dto.metadata.contextWindow !== undefined)
      model.contextWindow = dto.metadata.contextWindow;
    if (dto.metadata.maxOutputTokens !== undefined)
      model.maxOutputTokens = dto.metadata.maxOutputTokens;
    if (dto.metadata.knowledgeCutoff !== undefined)
      model.knowledgeCutoff = dto.metadata.knowledgeCutoff;
  }

  async #updateDeveloper(model: Model, dto: UpdateModelReqDto): Promise<void> {
    if (dto.developerId === undefined) return;

    const developer = await this.developerRepository.findOne({
      where: { id: dto.developerId },
    });

    if (!developer) {
      throw new NotFoundException(
        `Developer with id ${dto.developerId} not found`,
      );
    }

    model.developer = developer;
  }

  async remove(id: string): Promise<void> {

    const model = await this.findByIdOrFail(id);
    const modelValue = model.value;
    await this.deleteCacheByValueIfApplicable(modelValue);
    await this.modelRepository.remove(model);
    await this.#invalidateFindAllCache();
  }

  async getDevelopers(): Promise<ModelDeveloper[]> {
    return this.developerRepository.find({
      order: { name: 'ASC' },
    });
  }

  async existsByValue(value: string): Promise<boolean> {
    const count = await this.modelRepository.count({
      where: { value },
    });
    return count > 0;
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.modelRepository.count({
      where: { id },
    });
    return count > 0;
  }

  async validateGuestAccess(
    modelValue: string,
    userRole: string,
  ): Promise<void> {
    if (userRole !== 'guest') return;

    const cache = await this.appCacheService.get<ModelResDto>(
      `${CACHE_KEYS.GET_BY_VALUE_FOR_GUEST}:${modelValue}`,
    );

    if (cache) {
      if (!cache.guestAccess) {
        throw new BadRequestException(
          `Access denied. Model "${cache.name}" is not available for guest users.`,
        );
      }
      return;
    }

    const model = await this.modelRepository.findOne({
      where: { value: modelValue },
      select: ['id', 'name', 'guestAccess'],
    });

    if (!model)
      throw new NotFoundException(`Model with value "${modelValue}" not found`);

    if (!model.guestAccess)
      throw new BadRequestException(
        `Access denied. Model "${model.name}" is not available for guest users.`,
      );

    this.appCacheService.setLong(
      `${CACHE_KEYS.GET_BY_VALUE_FOR_GUEST}:${modelValue}`,
      {
        id: model.id,
        name: model.name,
        guestAccess: model.guestAccess,
      },
    );
  }

  async validateGuestAccessById(
    modelId: string,
    userRole: string,
  ): Promise<void> {
    if (userRole !== 'guest') return;

    const cache = await this.appCacheService.get<ModelResDto>(
      `${CACHE_KEYS.GET_BY_ID_FOR_GUEST}:${modelId}`,
    );

    if (cache) {
      if (!cache.guestAccess)
        throw new BadRequestException(
          `Access denied. Model "${cache.name}" is not available for guest users.`,
        );
      return;
    }

    const model = await this.modelRepository.findOne({
      where: { id: modelId },
      select: ['id', 'name', 'guestAccess'],
    });

    if (!model)
      throw new NotFoundException(`Model with id "${modelId}" not found`);

    if (!model.guestAccess)
      throw new BadRequestException(
        `Access denied. Model "${model.name}" is not available for guest users.`,
      );

    this.appCacheService.setLong(
      `${CACHE_KEYS.GET_BY_ID_FOR_GUEST}:${modelId}`,
      {
        id: model.id,
        name: model.name,
        guestAccess: model.guestAccess,
      },
    );

    return;
  }


  private async findByIdOrFail(id: string): Promise<Model> {
    const model = await this.modelRepository.findOne({
      where: { id },
      relations: ['developer'],
    });

    if (!model) {
      throw new NotFoundException(`Model with id ${id} not found`);
    }

    return model;
  }

  private mapToResponseDto(model: Model): ModelResDto {
    return {
      id: model.id,
      name: model.name,
      shortName: model.shortName,
      value: model.value,
      link: model.link,
      guestAccess: model.guestAccess,
      price: {
        input: Number(model.priceInput),
        output: Number(model.priceOutput),
      },
      supportsTemperature: model.supportsTemperature,
      isReasoning: model.isReasoning,
      reasoningLevel: model.reasoningLevel,
      metadata: {
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxOutputTokens,
        knowledgeCutoff: model.knowledgeCutoff,
      },
      developer: {
        id: model.developer.id,
        name: model.developer.name,
        link: model.developer.link,
        imageUrl: model.developer.imageUrl,
      },
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  async deleteCacheByValueIfApplicable(value: string): Promise<void> {
    if (await this.appCacheService.get(`${CACHE_KEYS.GET_BY_VALUE}:${value}`))
      this.appCacheService.del(`${CACHE_KEYS.GET_BY_VALUE}:${value}`);
  }

  async #invalidateFindAllCache(): Promise<void> {
    await this.appCacheService.del(CACHE_KEYS.MODELS_FIND_ALL);
  }
}
