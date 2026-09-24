import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileStoreService {
  #files = new Map<string, File>();

  storeFile(file: File): string {
    const id = crypto.randomUUID();
    this.#files.set(id, file);
    return id;
  }

  getFile(id: string): File | undefined {
    return this.#files.get(id);
  }

  removeFile(id: string): void {
    this.#files.delete(id);
  }

  clear(): void {
    this.#files.clear();
  }
}
