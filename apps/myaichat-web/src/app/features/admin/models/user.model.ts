import { RoleModel } from './role.model';

export interface UserModel {
  id: string;
  ghLogin: string;
  name: string;
  avatar?: string;
  email?: string;
  role: RoleModel;
  createdAt: Date;
  updatedAt: Date;
}
