import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../entities';

export class GetAllRolesResDto {
  @ApiProperty({
    description: 'List of all roles',
    type: [Role],
  })
  roles: Pick<Role, 'id' | 'name'>[];
}
