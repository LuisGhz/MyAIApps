export const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
] as const;

export const ALLOWED_FILE_EXTENSIONS = ['.png', '.jpeg', '.jpg'] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];
export type AllowedFileExtension = (typeof ALLOWED_FILE_EXTENSIONS)[number];
