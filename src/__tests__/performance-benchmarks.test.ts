import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  measureDataLoadTime,
  measureRenderTime,
  measureInteractionTime,
  measureMemoryUsage,
  measureTriangleRenderTime,
  formatBenchmarkResults,
  PERFORMANCE_THRESHOLDS,
  BenchmarkResult
} from '../utils/performanceBenchmarks';

// Mock performance API
const mockPerformance = {
  now: vi.fn(),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10 // 10MB
  }
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true
});

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(0);
  });

  describe('measureDataLoadTime', () => {
    it('should measure successful data loading time', async () => {
      mockPerformance.now
        .mockReturnValueOnce(0)    // start time
        .mockReturnValueOnce(1500); // end time

      const mockLoadFunction = vi.fn().mockResolvedValue('data');
      
      const result = await measureDataLoadTime(mockLoadFunction);
      
      expect(result.metric).toBe('Data Load Time');
      expect(result.value).toBe(1500);
      expect(result.unit).toBe('ms');
      expect(result.threshold).toBe(PERFORMANCE_THRESHOLDS.DATA_LOAD_TIME);
      expect(result.passed).toBe(true); // 1500ms < 2000ms threshold
      expect(mockLoadFunction).toHaveBeenCalledOnce();
    });

    it('should handle failed data loading', async () => {
      const mockLoadFunction = vi.fn().mockRejectedValue(new Error('Load failed'));
      
      const result = await measureDataLoadTime(mockLoadFunction);
      
      expect(result.value).toBe(-1);
      expect(result.passed).toBe(false);
    });

    it('should fail when load time exceeds threshold', async () => {
      mockPerformance.now
        .mockReturnValueOnce(0)    // start time
        .mockReturnValueOnce(3000); // end time (exceeds 2000ms threshold)

      const mockLoadFunction = vi.fn().mockResolvedValue('data');
      
      const result = await measureDataLoadTime(mockLoadFunction);
      
      expect(result.value).toBe(3000);
      expect(result.passed).toBe(false);
    });
  });

  describe('measureRenderTime', () => {
    it('should measure render time correctly', () => {
      mockPerformance.now
        .mockReturnValueOnce(0)   // start time
        .mockReturnValueOnce(300); // end time

      const mockRenderFunction = vi.fn();
      
      const result = measureRenderTime(mockRenderFunction);
      
      expect(result.metric).toBe('Component Render Time');
      expect(result.value).toBe(300);
      expect(result.unit).toBe('ms');
      expect(result.passed).toBe(true); // 300ms < 500ms threshold
      expect(mockRenderFunction).toHaveBeenCalledOnce();
    });

    it('should fail when render time exceeds threshold', () => {
      mockPerformance.now
        .mockReturnValueOnce(0)   // start time
        .mockReturnValueOnce(600); // end time (exceeds 500ms threshold)

      const mockRenderFunction = vi.fn();
      
      const result = measureRenderTime(mockRenderFunction);
      
      expect(result.value).toBe(600);
      expect(result.passed).toBe(false);
    });
  });

  describe('measureInteractionTime', () => {
    it('should measure synchronous interaction time', async () => {
      mockPerformance.now
        .mockReturnValueOnce(0)   // start time
        .mockReturnValueOnce(200); // end time

      const mockInteractionFunction = vi.fn();
      
      const result = await measureInteractionTime(mockInteractionFunction);
      
      expect(result.metric).toBe('Interaction Response Time');
      expect(result.value).toBe(200);
      expect(result.passed).toBe(true); // 200ms < 500ms threshold
    });

    it('should measure asynchronous interaction time', async () => {
      mockPerformance.now
        .mockReturnValueOnce(0)   // start time
        .mockReturnValueOnce(400); // end time

      const mockInteractionFunction = vi.fn().mockResolvedValue(undefined);
      
      const result = await measureInteractionTime(mockInteractionFunction);
      
      expect(result.value).toBe(400);
      expect(result.passed).toBe(true);
    });

    it('should handle interaction errors', async () => {
      const mockInteractionFunction = vi.fn().mockRejectedValue(new Error('Interaction failed'));
      
      const result = await measureInteractionTime(mockInteractionFunction);
      
      expect(result.value).toBe(-1);
      expect(result.passed).toBe(false);
    });
  });

  describe('measureMemoryUsage', () => {
    it('should measure memory usage correctly', () => {
      const result = measureMemoryUsage();
      
      expect(result.metric).toBe('Memory Usage');
      expect(result.value).toBe(1024 * 1024 * 10); // 10MB
      expect(result.unit).toBe('bytes');
      expect(result.passed).toBe(true); // 10MB < 50MB threshold
    });

    it('should handle missing memory API', () => {
      const originalMemory = mockPerformance.memory;
      delete (mockPerformance as any).memory;
      
      const result = measureMemoryUsage();
      
      expect(result.value).toBe(0);
      expect(result.passed).toBe(true);
      
      // Restore memory API
      mockPerformance.memory = originalMemory;
    });
  });

  describe('measureTriangleRenderTime', () => {
    it('should measure triangle rendering time', () => {
      mockPerformance.now
        .mockReturnValueOnce(0)  // start time
        .mockReturnValueOnce(80); // end time

      const mockRenderFunction = vi.fn();
      const triangleCount = 3;
      
      const result = measureTriangleRenderTime(triangleCount, mockRenderFunction);
      
      expect(result.metric).toBe('Triangle Render Time (3 triangles)');
      expect(result.value).toBe(80);
      expect(result.threshold).toBe(300); // 100ms * 3 triangles
      expect(result.passed).toBe(true);
    });

    it('should fail when triangle render time exceeds threshold', () => {
      mockPerformance.now
        .mockReturnValueOnce(0)   // start time
        .mockReturnValueOnce(350); // end time

      const mockRenderFunction = vi.fn();
      const triangleCount = 3;
      
      const result = measureTriangleRenderTime(triangleCount, mockRenderFunction);
      
      expect(result.value).toBe(350);
      expect(result.passed).toBe(false); // 350ms > 300ms threshold
    });
  });

  describe('formatBenchmarkResults', () => {
    it('should format benchmark results correctly', () => {
      const mockResults: BenchmarkResult[] = [
        {
          metric: 'Test Metric 1',
          value: 100,
          unit: 'ms',
          threshold: 200,
          passed: true,
          timestamp: Date.now()
        },
        {
          metric: 'Test Metric 2',
          value: 300,
          unit: 'ms',
          threshold: 250,
          passed: false,
          timestamp: Date.now()
        }
      ];
      
      const formatted = formatBenchmarkResults(mockResults);
      
      expect(formatted).toContain('Performance Benchmark Results');
      expect(formatted).toContain('✅ PASS Test Metric 1: 100.00ms');
      expect(formatted).toContain('❌ FAIL Test Metric 2: 300.00ms');
      expect(formatted).toContain('Summary: 1/2 benchmarks passed');
    });

    it('should handle empty results', () => {
      const formatted = formatBenchmarkResults([]);
      
      expect(formatted).toContain('Performance Benchmark Results');
      expect(formatted).toContain('Summary: 0/0 benchmarks passed');
    });
  });

  describe('Performance Thresholds', () => {
    it('should have reasonable threshold values', () => {
      expect(PERFORMANCE_THRESHOLDS.DATA_LOAD_TIME).toBe(2000);
      expect(PERFORMANCE_THRESHOLDS.INTERACTION_TIME).toBe(500);
      expect(PERFORMANCE_THRESHOLDS.TRIANGLE_RENDER_TIME).toBe(100);
      expect(PERFORMANCE_THRESHOLDS.MEMORY_USAGE).toBe(50 * 1024 * 1024);
      expect(PERFORMANCE_THRESHOLDS.FIRST_CONTENTFUL_PAINT).toBe(1500);
      expect(PERFORMANCE_THRESHOLDS.LARGEST_CONTENTFUL_PAINT).toBe(2500);
    });
  });
});