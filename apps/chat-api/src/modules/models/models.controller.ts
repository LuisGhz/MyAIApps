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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ModelsService } from './services';
import {
  CreateModelReqDto,
  CreateModelResDto,
  UpdateModelReqDto,
  UpdateModelResDto,
  ModelResDto,
  ModelListItemResDto,
  DeveloperListItemResDto,
} from './dto';
import { Admin } from '@cmn/decorators';

@ApiTags('models')
@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post()
  @Admin()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new AI model (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Model created successfully',
    type: CreateModelResDto,
  })
  async create(@Body() dto: CreateModelReqDto): Promise<CreateModelResDto> {
    return this.modelsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all AI models' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all models',
    type: [ModelListItemResDto],
  })
  async findAll(): Promise<ModelListItemResDto[]> {
    return this.modelsService.findAll();
  }

  @Get('developers')
  @Admin()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all model developers (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all developers',
    type: [DeveloperListItemResDto],
  })
  async getDevelopers(): Promise<DeveloperListItemResDto[]> {
    return this.modelsService.getDevelopers();
  }

  @Get('by-value')
  @Admin()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get model by value (Admin only)' })
  @ApiQuery({
    name: 'value',
    description: 'Model value/identifier',
    example: 'gpt-4o',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns model details',
    type: ModelResDto,
  })
  async findByValue(@Query('value') value: string): Promise<ModelResDto> {
    const data = await this.modelsService.findByValue(value);
    return data;
  }

  @Get(':id')
  @Admin()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get model by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Model ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns model details',
    type: ModelResDto,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ModelResDto> {
    return this.modelsService.findOne(id);
  }

  @Patch(':id')
  @Admin()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a model (Admin only)' })
  @ApiParam({ name: 'id', description: 'Model ID' })
  @ApiResponse({
    status: 200,
    description: 'Model updated successfully',
    type: UpdateModelResDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateModelReqDto,
  ): Promise<UpdateModelResDto> {
    return this.modelsService.update(id, dto);
  }

  @Delete(':id')
  @Admin()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a model (Admin only)' })
  @ApiParam({ name: 'id', description: 'Model ID' })
  @ApiResponse({
    status: 204,
    description: 'Model deleted successfully',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.modelsService.remove(id);
  }
}
