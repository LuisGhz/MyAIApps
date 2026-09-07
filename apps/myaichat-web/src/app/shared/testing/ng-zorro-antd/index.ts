/**
 * Ng-Zorro-Antd Testing Mocks
 *
 * This module provides mocks for ng-zorro-antd services and providers.
 * Compatible with Vitest and Testing Library.
 *
 * Note: UI component mocks have been removed. Let real ng-zorro components
 * render in tests to get proper template coverage.
 */

// Service mocks and test providers
export {
  createMockNzMessageService,
  createMockNzModalService,
  createMockNzNotificationService,
  provideTestNzIcons,
} from './services.mock';
