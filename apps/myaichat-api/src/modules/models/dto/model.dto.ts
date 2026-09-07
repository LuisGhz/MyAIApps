import { ApiProperty } from '@nestjs/swagger';

export class ModelDeveloperResDto {
  @ApiProperty({ description: 'Developer ID' })
  id: string;

  @ApiProperty({ description: 'Developer name' })
  name: string;

  @ApiProperty({ description: 'Developer website URL' })
  link: string;

  @ApiProperty({ description: 'Developer image URL' })
  imageUrl: string;
}

export class DeveloperListItemResDto {
  @ApiProperty({ description: 'Developer ID' })
  id: string;

  @ApiProperty({ description: 'Developer name' })
  name: string;

  @ApiProperty({ description: 'Developer website URL' })
  link: string;

  @ApiProperty({ description: 'Developer image URL' })
  imageUrl: string;
}

export class ModelResDto {
  @ApiProperty({ description: 'Model ID' })
  id: string;

  @ApiProperty({ description: 'Model full name' })
  name: string;

  @ApiProperty({ description: 'Model short name' })
  shortName: string;

  @ApiProperty({ description: 'Model value/identifier' })
  value: string;

  @ApiProperty({ description: 'Model documentation URL' })
  link: string;

  @ApiProperty({ description: 'Guest access enabled' })
  guestAccess: boolean;

  @ApiProperty({
    description: 'Model pricing',
    type: 'object',
    properties: {
      input: { type: 'number' },
      output: { type: 'number' },
    },
  })
  price: {
    input: number;
    output: number;
  };

  @ApiProperty({
    description: 'Indicates if the model supports temperature parameter',
  })
  supportsTemperature: boolean;

  @ApiProperty({
    description: 'Indicates if the model has reasoning capabilities',
  })
  isReasoning: boolean;

  @ApiProperty({ description: 'Reasoning level of the model', nullable: true })
  reasoningLevel: string | null;

  @ApiProperty({
    description: 'Model metadata',
    type: 'object',
    properties: {
      contextWindow: { type: 'number' },
      maxOutputTokens: { type: 'number' },
      knowledgeCutoff: { type: 'string' },
    },
  })
  metadata: {
    contextWindow: number;
    maxOutputTokens: number;
    knowledgeCutoff: string;
  };

  @ApiProperty({
    description: 'Developer details',
    type: ModelDeveloperResDto,
  })
  developer: ModelDeveloperResDto;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class ModelListItemResDto {
  @ApiProperty({ description: 'Model ID' })
  id: string;

  @ApiProperty({ description: 'Model full name' })
  name: string;

  @ApiProperty({ description: 'Model short name' })
  shortName: string;

  @ApiProperty({ description: 'Model value/identifier' })
  value: string;

  @ApiProperty({ description: 'Guest access enabled' })
  guestAccess: boolean;

  @ApiProperty({
    description: 'Developer basic info',
    type: 'object',
    properties: {
      name: { type: 'string' },
      imageUrl: { type: 'string' },
    },
  })
  developer: {
    name: string;
    imageUrl: string;
  };
}
