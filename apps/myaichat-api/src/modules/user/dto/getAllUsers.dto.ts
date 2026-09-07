import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities';

export class GetAllUsersResDto {
  @ApiProperty({
    description: 'List of all users',
    type: [User],
  })
  users: User[];
}
