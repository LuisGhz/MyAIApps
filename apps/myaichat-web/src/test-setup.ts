import { expect, beforeAll, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { TestBed } from '@angular/core/testing';

expect.extend(matchers);

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Filter function for Angular warnings that occur during test cleanup
const isAngularCleanupWarning = (message: unknown): boolean => {
  if (typeof message !== 'string') return false;
  return message.includes('NG0406') || message.includes('NG0205');
};

beforeAll(() => {
  // Suppress NG0406 and NG0205 warnings that occur when async operations complete after test cleanup
  // These warnings are harmless and don't affect test correctness
  console.error = (...args: unknown[]) => {
    if (isAngularCleanupWarning(args[0])) return;
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    if (isAngularCleanupWarning(args[0])) return;
    originalConsoleWarn.apply(console, args);
  };
});

// Reset TestBed after each test to ensure clean state
// afterEach(() => {
//   TestBed.resetTestingModule();
// });
