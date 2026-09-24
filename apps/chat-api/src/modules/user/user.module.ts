import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, User } from './entities';
import { RoleSeedService, UserService } from './services';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UserController],
  providers: [UserService, RoleSeedService],
  exports: [UserService],
})
export class UserModule {}
