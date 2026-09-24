import { IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTemperatureReqDto {
  @ApiProperty({
    description: 'Temperature for response randomness',
    minimum: 0,
    maximum: 2,
    example: 0.7,
  })
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature: number;
}
