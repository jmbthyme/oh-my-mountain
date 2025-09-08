/**
 * Performance benchmarking utilities for the Mountain Comparison Application
 * Measures and reports on key performance metrics
 */

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  triangleRenderTime: number;
}

export interface BenchmarkResult {
  metric: string;
  value: number;
  unit: string;
  threshold: number;
  passed: boolean;
  timestamp: number;
}

/**
 * Performance thresholds based on requirements
 */
export const PERFORMANCE_THRESHOLDS = {
  DATA_LOAD_TIME: 2000, // 2 seconds - Requirement 5.1
  INTERACTION_TIME: 500, // 500ms - Requirement 5.2
  TRIANGLE_RENDER_TIME: 100, // 100ms for smooth rendering
  MEMORY_USAGE: 50 * 1024 * 1024, // 50MB reasonable limit
  FIRST_CONTENTFUL_PAINT: 1500, // 1.5 seconds
  LARGEST_CONTENTFUL_PAINT: 2500, // 2.5 seconds
} as const;

/**
 * Measures data loading performance
 */
export const measureDataLoadTime = async (loadFunction: () => Promise<any>): Promise<BenchmarkResult> => {
  const startTime = performance.now();
  
  try {
    await loadFunction();
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    return {
      metric: 'Data Load Time',
      value: loadTime,
      unit: 'ms',
      threshold: PERFORMANCE_THRESHOLDS.DATA_LOAD_TIME,
      passed: loadTime <= PERFORMANCE_THRESHOLDS.DATA_LOAD_TIME,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      metric: 'Data Load Time',
      value: -1,
      unit: 'ms',
      threshold: PERFORMANCE_THRESHOLDS.DATA_LOAD_TIME,
      passed: false,
      timestamp: Date.now()
    };
  }
};

/**
 * Measures component render performance
 */
export const measureRenderTime = (renderFunction: () => void): BenchmarkResult => {
  const startTime = performance.now();
  renderFunction();
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  return {
    metric: 'Component Render Time',
    value: renderTime,
    unit: 'ms',
    threshold: PERFORMANCE_THRESHOLDS.INTERACTION_TIME,
    passed: renderTime <= PERFORMANCE_THRESHOLDS.INTERACTION_TIME,
    timestamp: Date.now()
  };
};

/**
 * Measures interaction response time
 */
export const measureInteractionTime = async (interactionFunction: () => Promise<void> | void): Promise<BenchmarkResult> => {
  const startTime = performance.now();
  
  try {
    await interactionFunction();
    const endTime = performance.now();
    const interactionTime = endTime - startTime;
    
    return {
      metric: 'Interaction Response Time',
      value: interactionTime,
      unit: 'ms',
      threshold: PERFORMANCE_THRESHOLDS.INTERACTION_TIME,
      passed: interactionTime <= PERFORMANCE_THRESHOLDS.INTERACTION_TIME,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      metric: 'Interaction Response Time',
      value: -1,
      unit: 'ms',
      threshold: PERFORMANCE_THRESHOLDS.INTERACTION_TIME,
      passed: false,
      timestamp: Date.now()
    };
  }
};

/**
 * Measures memory usage
 */
export const measureMemoryUsage = (): BenchmarkResult => {
  const memoryInfo = (performance as any).memory;
  const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize : 0;
  
  return {
    metric: 'Memory Usage',
    value: memoryUsage,
    unit: 'bytes',
    threshold: PERFORMANCE_THRESHOLDS.MEMORY_USAGE,
    passed: memoryUsage <= PERFORMANCE_THRESHOLDS.MEMORY_USAGE,
    timestamp: Date.now()
  };
};

/**
 * Measures triangle rendering performance
 */
export const measureTriangleRenderTime = (triangleCount: number, renderFunction: () => void): BenchmarkResult => {
  const startTime = performance.now();
  renderFunction();
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  return {
    metric: `Triangle Render Time (${triangleCount} triangles)`,
    value: renderTime,
    unit: 'ms',
    threshold: PERFORMANCE_THRESHOLDS.TRIANGLE_RENDER_TIME * triangleCount,
    passed: renderTime <= PERFORMANCE_THRESHOLDS.TRIANGLE_RENDER_TIME * triangleCount,
    timestamp: Date.now()
  };
};

/**
 * Gets Web Vitals metrics
 */
export const getWebVitals = (): Promise<BenchmarkResult[]> => {
  return new Promise((resolve) => {
    const results: BenchmarkResult[] = [];
    
    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          results.push({
            metric: 'First Contentful Paint',
            value: entry.startTime,
            unit: 'ms',
            threshold: PERFORMANCE_THRESHOLDS.FIRST_CONTENTFUL_PAINT,
            passed: entry.startTime <= PERFORMANCE_THRESHOLDS.FIRST_CONTENTFUL_PAINT,
            timestamp: Date.now()
          });
        }
        
        if (entry.name === 'largest-contentful-paint') {
          results.push({
            metric: 'Largest Contentful Paint',
            value: entry.startTime,
            unit: 'ms',
            threshold: PERFORMANCE_THRESHOLDS.LARGEST_CONTENTFUL_PAINT,
            passed: entry.startTime <= PERFORMANCE_THRESHOLDS.LARGEST_CONTENTFUL_PAINT,
            timestamp: Date.now()
          });
        }
      }
      
      if (results.length >= 2) {
        resolve(results);
      }
    });
    
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    
    // Fallback timeout
    setTimeout(() => {
      resolve(results);
    }, 5000);
  });
};

/**
 * Runs a comprehensive performance benchmark suite
 */
export const runPerformanceBenchmarks = async (): Promise<BenchmarkResult[]> => {
  const results: BenchmarkResult[] = [];
  
  // Memory usage
  results.push(measureMemoryUsage());
  
  // Web Vitals
  const webVitals = await getWebVitals();
  results.push(...webVitals);
  
  return results;
};

/**
 * Formats benchmark results for display
 */
export const formatBenchmarkResults = (results: BenchmarkResult[]): string => {
  let output = 'Performance Benchmark Results\n';
  output += '================================\n\n';
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    output += `${status} ${result.metric}: ${result.value.toFixed(2)}${result.unit} (threshold: ${result.threshold}${result.unit})\n`;
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  output += `\nSummary: ${passedCount}/${totalCount} benchmarks passed\n`;
  
  return output;
};

/**
 * Logs benchmark results to console
 */
export const logBenchmarkResults = (results: BenchmarkResult[]): void => {
  console.group('🚀 Performance Benchmarks');
  
  results.forEach(result => {
    const method = result.passed ? 'log' : 'warn';
    console[method](`${result.metric}: ${result.value.toFixed(2)}${result.unit} (threshold: ${result.threshold}${result.unit})`);
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  if (passedCount === totalCount) {
    console.log(`✅ All ${totalCount} benchmarks passed!`);
  } else {
    console.warn(`⚠️ ${totalCount - passedCount} of ${totalCount} benchmarks failed`);
  }
  
  console.groupEnd();
};