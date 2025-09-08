import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock performance API for tests
Object.defineProperty(global, 'performance', {
  value: {
    now: () => Date.now(),
    memory: {
      usedJSHeapSize: 1024 * 1024 * 10 // 10MB
    }
  },
  writable: true
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};