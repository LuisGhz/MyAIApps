import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FileStoreService } from './file-store.service';

describe('FileStoreService', () => {
  let service: FileStoreService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FileStoreService();
  });

  it('should store and retrieve files by generated id', () => {
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    const generatedId = '11111111-1111-4111-8111-111111111111';
    const randomUuidSpy = vi.spyOn(crypto, 'randomUUID').mockReturnValue(generatedId);

    const fileId = service.storeFile(file);

    expect(randomUuidSpy).toHaveBeenCalledOnce();
    expect(fileId).toBe(generatedId);
    expect(service.getFile(fileId)).toBe(file);
  });

  it('should remove a stored file', () => {
    const fileId = service.storeFile(new File(['hello'], 'notes.txt', { type: 'text/plain' }));

    service.removeFile(fileId);

    expect(service.getFile(fileId)).toBeUndefined();
  });

  it('should clear all stored files', () => {
    const firstFileId = service.storeFile(new File(['one'], 'one.txt', { type: 'text/plain' }));
    const secondFileId = service.storeFile(new File(['two'], 'two.txt', { type: 'text/plain' }));

    service.clear();

    expect(service.getFile(firstFileId)).toBeUndefined();
    expect(service.getFile(secondFileId)).toBeUndefined();
  });
});
