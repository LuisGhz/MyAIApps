import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { select } from '@ngxs/store';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MarkdownModule } from 'ngx-markdown';
import { ChatStore } from '@st/chat/chat.store';

@Component({
  selector: 'app-messages',
  imports: [NzIconModule, MarkdownModule],
  templateUrl: './messages.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full w-full' },
})
export class Messages {
  readonly messages = select(ChatStore.getMessages);
  #copiedIndex = signal<number | null>(null);

  onCopyClick(content: string, index: number): void {
    this.#copyToClipboard(content, index);
  }

  isCopied(index: number): boolean {
    return this.#copiedIndex() === index;
  }

  isImage(file: File | string): boolean {
    if (typeof file === 'string') {
      return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(file);
    }
    return file.type.startsWith('image/');
  }

  getFileUrl(file: File | string): string {
    if (typeof file === 'string') {
      return file;
    }
    return URL.createObjectURL(file);
  }

  getFileIcon(file: File | string): string {
    const type = typeof file === 'string' ? '' : file.type.toLowerCase();
    const name = typeof file === 'string' ? file.toLowerCase() : file.name.toLowerCase();

    if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(name)) {
      return 'picture';
    }
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
      return 'file-pdf';
    }
    if (
      type.includes('word') ||
      type.includes('document') ||
      name.endsWith('.doc') ||
      name.endsWith('.docx')
    ) {
      return 'file-word';
    }
    if (
      type.includes('spreadsheet') ||
      type.includes('excel') ||
      name.endsWith('.xlsx') ||
      name.endsWith('.xls')
    ) {
      return 'file-excel';
    }
    if (
      type.includes('presentation') ||
      type.includes('powerpoint') ||
      name.endsWith('.pptx') ||
      name.endsWith('.ppt')
    ) {
      return 'file-ppt';
    }
    if (type === 'text/plain' || name.endsWith('.txt')) {
      return 'file-text';
    }
    return 'file';
  }

  getFileName(file: File | string): string {
    if (typeof file === 'string') {
      return file.split('/').pop() || file;
    }
    return file.name;
  }

  async #copyToClipboard(text: string, index: number): Promise<void> {
    const MS = 500;
    try {
      await navigator.clipboard.writeText(text);
      this.#copiedIndex.set(index);
      setTimeout(() => this.#copiedIndex.set(null), MS);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
}
