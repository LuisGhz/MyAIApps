import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'public';

export const Public = (...args: string[]) => SetMetadata(PUBLIC_KEY, args);
