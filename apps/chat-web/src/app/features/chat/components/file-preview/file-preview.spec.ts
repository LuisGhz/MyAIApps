import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideStore, Store } from '@ngxs/store';
import { provideEnvironmentInitializer, inject } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideTestNzIcons } from '@sh/testing';

import { FilePreview } from './file-preview';
import { ChatStore } from '@st/chat/chat.store';
import { ChatActions } from '@st/chat/chat.actions';
import { FileStoreService } from '@st/chat/services';
import { FileInfo } from '@st/chat/models';

interface RenderOptions {
  fileInfo?: FileInfo | undefined;
  mockFileContent?: File | undefined;
}

const createMockFile = (name: string, type: string): File => {
  return new File(['test content'], name, { type });
};

const mockFileStoreService = {
  getFile: vi.fn(),
  storeFile: vi.fn(),
  removeFile: vi.fn(),
  clear: vi.fn(),
};

describe('FilePreview', () => {
  const renderComponent = async (options: RenderOptions = {}) => {
    const { fileInfo = undefined, mockFileContent = undefined } = options;

    if (mockFileContent) {
      mockFileStoreService.getFile.mockReturnValue(mockFileContent);
    } else {
      mockFileStoreService.getFile.mockReturnValue(undefined);
    }

    const result = await render(FilePreview, {
      providers: [
        provideHttpClient(),
        provideNoopAnimations(),
        provideTestNzIcons(),
        provideStore([ChatStore]),
        { provide: FileStoreService, useValue: mockFileStoreService },
        provideEnvironmentInitializer(() => {
          const store = inject(Store);
          if (fileInfo) {
            store.dispatch(new ChatActions.SetOps({ file: fileInfo }));
          }
        }),
      ],
    });

    const store = result.fixture.debugElement.injector.get(Store);

    return { ...result, store };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create', async () => {
    const { fixture } = await renderComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display image preview when file is an image', async () => {
    const imageFile = createMockFile('photo.png', 'image/png');
    const fileInfo: FileInfo = {
      id: 'file-1',
      name: 'photo.png',
      size: 1024,
      type: 'image/png',
      lastModified: Date.now(),
    };

    await renderComponent({ fileInfo, mockFileContent: imageFile });

    const imgElement = screen.getByRole('img', { name: 'photo.png' });
    expect(imgElement).toBeInTheDocument();
  });

  it('should display file icon for non-image files', async () => {
    const pdfFile = createMockFile('document.pdf', 'application/pdf');
    const fileInfo: FileInfo = {
      id: 'file-2',
      name: 'document.pdf',
      size: 2048,
      type: 'application/pdf',
      lastModified: Date.now(),
    };

    const { fixture } = await renderComponent({ fileInfo, mockFileContent: pdfFile });

    expect(fixture.componentInstance.isImage()).toBe(false);
    expect(fixture.componentInstance.fileIcon()).toBe('file-pdf');
  });

  it('should remove file when remove button is clicked', async () => {
    const imageFile = createMockFile('photo.jpg', 'image/jpeg');
    const fileInfo: FileInfo = {
      id: 'file-3',
      name: 'photo.jpg',
      size: 1024,
      type: 'image/jpeg',
      lastModified: Date.now(),
    };

    const { store, fixture } = await renderComponent({ fileInfo, mockFileContent: imageFile });
    const user = userEvent.setup();

    const removeButton = screen.getByRole('button', { name: 'Remove file' });
    await user.click(removeButton.querySelector('nz-icon')!);
    fixture.detectChanges();

    expect(store.selectSnapshot(ChatStore.getOps).file).toBeUndefined();
  });

  it('should return correct file icons for different file types', async () => {
    const wordFile = createMockFile('document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const fileInfo: FileInfo = {
      id: 'file-4',
      name: 'document.docx',
      size: 3072,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      lastModified: Date.now(),
    };

    const { fixture } = await renderComponent({ fileInfo, mockFileContent: wordFile });

    expect(fixture.componentInstance.fileIcon()).toBe('file-word');
  });

  it('should not render anything when no file is provided', async () => {
    const { fixture } = await renderComponent();

    expect(fixture.componentInstance.fileName()).toBe('');
    expect(screen.queryByRole('button', { name: 'Remove file' })).not.toBeInTheDocument();
  });

  it('should display file icon when image file is not found in store', async () => {
    const fileInfo: FileInfo = {
      id: 'file-5',
      name: 'missing-image.png',
      size: 1024,
      type: 'image/png',
      lastModified: Date.now(),
    };

    const { fixture } = await renderComponent({ fileInfo, mockFileContent: undefined });

    expect(fixture.componentInstance.isImage()).toBe(true);
    expect(fixture.componentInstance.imagePreview()).toBe('');
  });

  it('should return generic file icon for unknown file types', async () => {
    const unknownFile = createMockFile('unknown.xyz', 'application/octet-stream');
    const fileInfo: FileInfo = {
      id: 'file-6',
      name: 'unknown.xyz',
      size: 1024,
      type: 'application/octet-stream',
      lastModified: Date.now(),
    };

    const { fixture } = await renderComponent({ fileInfo, mockFileContent: unknownFile });

    expect(fixture.componentInstance.fileIcon()).toBe('file');
  });

  it('should handle file type matching by extension when MIME type is generic', async () => {
    const textFile = createMockFile('notes.txt', 'text/plain');
    const fileInfo: FileInfo = {
      id: 'file-7',
      name: 'notes.txt',
      size: 512,
      type: 'text/plain',
      lastModified: Date.now(),
    };

    const { fixture } = await renderComponent({ fileInfo, mockFileContent: textFile });

    expect(fixture.componentInstance.fileIcon()).toBe('file-text');
  });

  it('should match file-word icon before file-excel when MIME contains "document"', async () => {
    const excelFile = createMockFile('data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const fileInfo: FileInfo = {
      id: 'file-8',
      name: 'data.xlsx',
      size: 4096,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      lastModified: Date.now(),
    };

    const { fixture } = await renderComponent({ fileInfo, mockFileContent: excelFile });

    // Note: Due to the order of checks in #getIconForFile, MIME types containing "document"
    // match the Word check before the Excel check
    expect(fixture.componentInstance.fileIcon()).toBe('file-word');
  });

  it('should match file-word icon before file-ppt when MIME contains "document"', async () => {
    const pptFile = createMockFile('slides.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    const fileInfo: FileInfo = {
      id: 'file-9',
      name: 'slides.pptx',
      size: 5120,
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      lastModified: Date.now(),
    };

    const { fixture } = await renderComponent({ fileInfo, mockFileContent: pptFile });

    // Note: Due to the order of checks in #getIconForFile, MIME types containing "document"
    // match the Word check before the PowerPoint check
    expect(fixture.componentInstance.fileIcon()).toBe('file-word');
  });

  it('should handle file with empty name', async () => {
    const file = createMockFile('', 'application/pdf');
    const fileInfo: FileInfo = {
      id: 'file-10',
      name: '',
      size: 1024,
      type: 'application/pdf',
      lastModified: Date.now(),
    };

    const { fixture } = await renderComponent({ fileInfo, mockFileContent: file });

    expect(fixture.componentInstance.fileName()).toBe('');
    expect(fixture.componentInstance.fileIcon()).toBe('file-pdf');
  });

  it('should handle very large file size', async () => {
    const largeFile = createMockFile('large-video.mp4', 'video/mp4');
    const fileInfo: FileInfo = {
      id: 'file-11',
      name: 'large-video.mp4',
      size: 5368709120, // 5GB
      type: 'video/mp4',
      lastModified: Date.now(),
    };

    const { fixture } = await renderComponent({ fileInfo, mockFileContent: largeFile });

    expect(fixture.componentInstance.fileName()).toBe('large-video.mp4');
    expect(fixture.componentInstance.fileIcon()).toBe('file');
  });

  it('should handle file with special characters in name', async () => {
    const file = createMockFile('test@#$%file(1).pdf', 'application/pdf');
    const fileInfo: FileInfo = {
      id: 'file-12',
      name: 'test@#$%file(1).pdf',
      size: 2048,
      type: 'application/pdf',
      lastModified: Date.now(),
    };

    const { fixture } = await renderComponent({ fileInfo, mockFileContent: file });

    expect(fixture.componentInstance.fileName()).toBe('test@#$%file(1).pdf');
    expect(fixture.componentInstance.fileIcon()).toBe('file-pdf');
  });

  it('should handle file type with uppercase characters', async () => {
    const file = createMockFile('DOCUMENT.PDF', 'APPLICATION/PDF');
    const fileInfo: FileInfo = {
      id: 'file-13',
      name: 'DOCUMENT.PDF',
      size: 1024,
      type: 'APPLICATION/PDF',
      lastModified: Date.now(),
    };

    const { fixture } = await renderComponent({ fileInfo, mockFileContent: file });

    expect(fixture.componentInstance.fileIcon()).toBe('file-pdf');
  });
});
