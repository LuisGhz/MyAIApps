import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleReqDto {
  @ApiProperty({
    description: 'Role ID to assign to the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}

export class UpdateUserRoleResDto {
  @ApiProperty({
    description: 'Success message',
    example: 'User role updated successfully',
  })
  message: string;
}
