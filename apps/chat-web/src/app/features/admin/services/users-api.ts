import { Injectable } from '@angular/core';
import { HttpBaseService } from '@core/services/http-base.service';
import {
  GetAllUsersResModel,
  GetAllRolesResModel,
  UpdateUserRoleReqModel,
  UpdateUserRoleResModel,
  UserModel,
  RoleModel,
} from '../models';

@Injectable({ providedIn: 'root' })
export class UsersApi extends HttpBaseService {
  async fetchAll(): Promise<UserModel[]> {
    const response = await this.getP<GetAllUsersResModel>('/user');
    return response.users;
  }

  async fetchRoles(): Promise<RoleModel[]> {
    const response = await this.getP<GetAllRolesResModel>('/user/roles');
    return response.roles;
  }

  async updateUserRole(
    userId: string,
    req: UpdateUserRoleReqModel,
  ): Promise<UpdateUserRoleResModel> {
    return await this.patchP<UpdateUserRoleResModel, UpdateUserRoleReqModel>(
      `/user/${userId}/update-role`,
      req,
    );
  }
}
