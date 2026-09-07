import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { dispatch, select } from '@ngxs/store';
import { ChatStore } from '@st/chat/chat.store';
import { FileStoreService } from '@st/chat/services';
import { FileInfo } from '@st/chat/models';
import { ChatActions } from '@st/chat/chat.actions';

@Component({
  selector: 'app-file-preview',
  imports: [NzIconModule],
  templateUrl: './file-preview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilePreview {
  readonly #fileStoreService = inject(FileStoreService);
  readonly #fileInfo = select(ChatStore.getOps);
  readonly #removeFile = dispatch(ChatActions.RemoveFile);
  readonly isImage = computed(() => {
    const fileInfo = this.#fileInfo().file;
    if (!fileInfo) return false;
    return fileInfo.type.startsWith('image/');
  });
  readonly imagePreview = computed(() => {
    const fileInfo = this.#fileInfo().file;
    if (!fileInfo) return '';
    const file = this.#fileStoreService.getFile(fileInfo.id);
    return file ? URL.createObjectURL(file) : '';
  });
  readonly fileIcon = computed(() => {
    const fileInfo = this.#fileInfo().file;
    if (!fileInfo) return 'file';
    return this.#getIconForFile(fileInfo);
  });
  readonly fileName = computed(() => {
    const fileInfo = this.#fileInfo().file;
    return fileInfo?.name || '';
  });

  #getIconForFile(fileInfo: FileInfo): string {
    const type = fileInfo.type.toLowerCase();
    const name = fileInfo.name.toLowerCase();

    // Image types
    if (type.startsWith('image/')) {
      return 'picture';
    }

    // PDF
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return 'file-pdf';
    }

    // Word documents
    if (
      type.includes('word') ||
      type.includes('document') ||
      name.endsWith('.doc') ||
      name.endsWith('.docx')
    ) {
      return 'file-word';
    }

    // Excel spreadsheets
    if (
      type.includes('spreadsheet') ||
      type.includes('excel') ||
      name.endsWith('.xlsx') ||
      name.endsWith('.xls')
    ) {
      return 'file-excel';
    }

    // PowerPoint presentations
    if (
      type.includes('presentation') ||
      type.includes('powerpoint') ||
      name.endsWith('.pptx') ||
      name.endsWith('.ppt')
    ) {
      return 'file-ppt';
    }

    // Text files
    if (type === 'text/plain' || name.endsWith('.txt')) {
      return 'file-text';
    }

    // Default to generic file icon
    return 'file';
  }

  removeFile(): void {
    this.#removeFile();
  }
}
