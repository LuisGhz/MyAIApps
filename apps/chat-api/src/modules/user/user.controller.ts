import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Admin, CurrentUser } from '@cmn/decorators';
import type { JwtPayload } from '@cmn/interfaces';
import { UserService } from './services';
import {
  GetAllRolesResDto,
  GetAllUsersResDto,
  UpdateUserRoleReqDto,
  UpdateUserRoleResDto,
} from './dto';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
@Admin()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all users',
    type: GetAllUsersResDto,
  })
  async getAllUsers(): Promise<GetAllUsersResDto> {
    const users = await this.userService.findAll();
    return { users };
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all roles',
    type: GetAllRolesResDto,
  })
  async getAllRoles(): Promise<GetAllRolesResDto> {
    const roles = await this.userService.findAllRoles();
    return { roles };
  }

  @Patch(':id/update-role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
    type: UpdateUserRoleResDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot update own role',
  })
  async updateUserRole(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserRoleReqDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<UpdateUserRoleResDto> {
    if (currentUser.sub === userId)
      throw new BadRequestException("You can't update your own role");

    await this.userService.updateUserRole(userId, dto.roleId);
    return { message: 'User role updated successfully' };
  }
}
