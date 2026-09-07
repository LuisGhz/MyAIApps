import { SetMetadata } from '@nestjs/common';

export const ADMIN_ROLE_KEY = 'admin-role';

export const Admin = () => SetMetadata(ADMIN_ROLE_KEY, true);
