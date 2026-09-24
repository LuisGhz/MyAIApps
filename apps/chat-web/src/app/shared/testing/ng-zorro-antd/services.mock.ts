import { vi } from 'vitest';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  GithubOutline,
  PlusOutline,
  EditOutline,
  DeleteOutline,
  AudioOutline,
  SendOutline,
  CloseOutline,
  MenuUnfoldOutline,
  MenuFoldOutline,
  ShareAltOutline,
  UserAddOutline,
  MoreOutline,
  SearchOutline,
  InboxOutline,
  MessageOutline,
  FileTextOutline,
  PaperClipOutline,
  CloudUploadOutline,
  PictureOutline,
  ExperimentOutline,
  RadarChartOutline,
  ShoppingCartOutline,
  ReadOutline,
  CompassOutline,
  RightOutline,
  FilePdfOutline,
  FileWordOutline,
  FileExcelOutline,
  FilePptOutline,
  FileOutline,
  SettingOutline,
  SettingFill,
  LogoutOutline,
  CopyOutline,
  StopOutline,
  LoadingOutline,
} from '@ant-design/icons-angular/icons';

/**
 * Provides ng-zorro icons for testing
 * Use this in your test providers to register all commonly used icons
 *
 * @example
 * ```typescript
 * await render(MyComponent, {
 *   providers: [provideTestNzIcons()],
 * });
 * ```
 */
export function provideTestNzIcons() {
  return provideNzIcons([
    GithubOutline,
    PlusOutline,
    EditOutline,
    DeleteOutline,
    AudioOutline,
    SendOutline,
    CloseOutline,
    MenuUnfoldOutline,
    MenuFoldOutline,
    ShareAltOutline,
    UserAddOutline,
    MoreOutline,
    SearchOutline,
    InboxOutline,
    MessageOutline,
    FileTextOutline,
    PaperClipOutline,
    CloudUploadOutline,
    PictureOutline,
    ExperimentOutline,
    RadarChartOutline,
    ShoppingCartOutline,
    ReadOutline,
    CompassOutline,
    RightOutline,
    FilePdfOutline,
    FileWordOutline,
    FileExcelOutline,
    FilePptOutline,
    FileOutline,
    SettingOutline,
    SettingFill,
    LogoutOutline,
    CopyOutline,
    StopOutline,
    LoadingOutline,
  ]);
}

/**
 * Creates a mock NzMessageService
 *
 * @param overrides Optional overrides for specific methods
 * @returns Mock NzMessageService instance
 *
 * @example
 * ```typescript
 * const mockMessageService = createMockNzMessageService({
 *   success: vi.fn().mockReturnValue({ messageId: '1' })
 * });
 *
 * TestBed.configureTestingModule({
 *   providers: [
 *     { provide: NzMessageService, useValue: mockMessageService }
 *   ]
 * });
 * ```
 */
export function createMockNzMessageService(overrides?: Partial<any>) {
  return {
    success: vi.fn().mockReturnValue({ messageId: 'success-id' }),
    error: vi.fn().mockReturnValue({ messageId: 'error-id' }),
    info: vi.fn().mockReturnValue({ messageId: 'info-id' }),
    warning: vi.fn().mockReturnValue({ messageId: 'warning-id' }),
    loading: vi.fn().mockReturnValue({ messageId: 'loading-id' }),
    create: vi.fn().mockReturnValue({ messageId: 'create-id' }),
    remove: vi.fn(),
    ...overrides,
  };
}

/**
 * Creates a mock NzModalService
 *
 * @param overrides Optional overrides for specific methods
 * @returns Mock NzModalService instance
 *
 * @example
 * ```typescript
 * const mockModalService = createMockNzModalService({
 *   create: vi.fn().mockReturnValue({
 *     afterClose: of(true),
 *     close: vi.fn()
 *   })
 * });
 *
 * TestBed.configureTestingModule({
 *   providers: [
 *     { provide: NzModalService, useValue: mockModalService }
 *   ]
 * });
 * ```
 */
export function createMockNzModalService(overrides?: Partial<any>) {
  const mockModalRef = {
    afterOpen: { subscribe: vi.fn() },
    afterClose: { subscribe: vi.fn() },
    close: vi.fn(),
    destroy: vi.fn(),
    updateConfig: vi.fn(),
    getContentComponent: vi.fn(),
    triggerOk: vi.fn().mockReturnValue(Promise.resolve()),
    triggerCancel: vi.fn(),
  };

  return {
    create: vi.fn().mockReturnValue(mockModalRef),
    confirm: vi.fn().mockReturnValue(mockModalRef),
    info: vi.fn().mockReturnValue(mockModalRef),
    success: vi.fn().mockReturnValue(mockModalRef),
    error: vi.fn().mockReturnValue(mockModalRef),
    warning: vi.fn().mockReturnValue(mockModalRef),
    closeAll: vi.fn(),
    ...overrides,
  };
}

/**
 * Creates a mock NzNotificationService
 *
 * @param overrides Optional overrides for specific methods
 * @returns Mock NzNotificationService instance
 *
 * @example
 * ```typescript
 * const mockNotificationService = createMockNzNotificationService({
 *   success: vi.fn()
 * });
 *
 * TestBed.configureTestingModule({
 *   providers: [
 *     { provide: NzNotificationService, useValue: mockNotificationService }
 *   ]
 * });
 * ```
 */
export function createMockNzNotificationService(overrides?: Partial<any>) {
  return {
    success: vi.fn().mockReturnValue({ messageId: 'success-id' }),
    error: vi.fn().mockReturnValue({ messageId: 'error-id' }),
    info: vi.fn().mockReturnValue({ messageId: 'info-id' }),
    warning: vi.fn().mockReturnValue({ messageId: 'warning-id' }),
    blank: vi.fn().mockReturnValue({ messageId: 'blank-id' }),
    create: vi.fn().mockReturnValue({ messageId: 'create-id' }),
    remove: vi.fn(),
    ...overrides,
  };
}
