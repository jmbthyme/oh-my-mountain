/**
 * Performance monitoring utilities
 * Requirements: 5.1, 5.2 - Monitor loading and interaction performance
 */

import { useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean;

  constructor() {
    // Enable performance monitoring in development or when explicitly enabled
    this.isEnabled = import.meta.env.DEV || 
                    localStorage.getItem('enablePerformanceMonitoring') === 'true';
  }

  /**
   * Start measuring a performance metric
   */
  start(name: string): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * End measuring a performance metric and log the result
   */
  end(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log performance metrics in development
    if (import.meta.env.DEV) {
      this.logMetric(name, duration);
    }

    // Check against performance requirements
    this.checkPerformanceRequirements(name, duration);

    return duration;
  }

  /**
   * Measure the execution time of a function
   */
  measure<T>(name: string, fn: () => T): T {
    if (!this.isEnabled) return fn();

    this.start(name);
    try {
      const result = fn();
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.finally(() => {
          this.end(name);
        }) as T;
      }
      
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Measure async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) return fn();

    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values()).filter(m => m.duration !== undefined);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Log performance metric to console
   */
  private logMetric(name: string, duration: number): void {
    const color = duration > 1000 ? 'color: red' : 
                  duration > 500 ? 'color: orange' : 
                  'color: green';
    
    console.log(
      `%c⚡ Performance: ${name} took ${duration.toFixed(2)}ms`,
      color
    );
  }

  /**
   * Check performance against requirements and warn if exceeded
   */
  private checkPerformanceRequirements(name: string, duration: number): void {
    const requirements: Record<string, number> = {
      'data-loading': 2000,        // Requirement 5.1: 2 seconds
      'mountain-selection': 500,   // Requirement 5.2: 500ms
      'mountain-deselection': 500, // Requirement 5.2: 500ms
      'clear-selections': 500,     // Requirement 5.2: 500ms
      'window-resize': 500,        // Requirement 5.2: 500ms
      'triangle-rendering': 500,   // Requirement 5.2: 500ms
    };

    const requirement = requirements[name];
    if (requirement && duration > requirement) {
      console.warn(
        `⚠️ Performance Warning: ${name} took ${duration.toFixed(2)}ms, ` +
        `exceeding requirement of ${requirement}ms`
      );
    }
  }

  /**
   * Monitor React component render performance
   */
  measureRender(componentName: string): {
    onRenderStart: () => void;
    onRenderEnd: () => void;
  } {
    let renderStartTime: number;

    return {
      onRenderStart: () => {
        if (this.isEnabled) {
          renderStartTime = performance.now();
        }
      },
      onRenderEnd: () => {
        if (this.isEnabled && renderStartTime) {
          const duration = performance.now() - renderStartTime;
          this.logMetric(`${componentName} render`, duration);
          
          if (duration > 16.67) { // 60fps threshold
            console.warn(
              `⚠️ Render Warning: ${componentName} render took ${duration.toFixed(2)}ms, ` +
              `may cause frame drops (>16.67ms)`
            );
          }
        }
      },
    };
  }

  /**
   * Monitor memory usage (if available)
   */
  logMemoryUsage(label: string): void {
    if (!this.isEnabled) return;

    // @ts-ignore - performance.memory is not in all browsers
    if (performance.memory) {
      // @ts-ignore
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
      
      console.log(
        `🧠 Memory (${label}): ` +
        `Used: ${(usedJSHeapSize / 1024 / 1024).toFixed(2)}MB, ` +
        `Total: ${(totalJSHeapSize / 1024 / 1024).toFixed(2)}MB, ` +
        `Limit: ${(jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      );
    }
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('enablePerformanceMonitoring', enabled.toString());
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export utility functions for easier use
export const measurePerformance = {
  start: (name: string) => performanceMonitor.start(name),
  end: (name: string) => performanceMonitor.end(name),
  measure: <T>(name: string, fn: () => T) => performanceMonitor.measure(name, fn),
  measureAsync: <T>(name: string, fn: () => Promise<T>) => performanceMonitor.measureAsync(name, fn),
};

// React hook for measuring component performance
export function usePerformanceMonitor(componentName: string) {
  const { onRenderStart, onRenderEnd } = performanceMonitor.measureRender(componentName);
  
  useEffect(() => {
    onRenderStart();
    return onRenderEnd;
  });

  return {
    measureInteraction: (name: string, fn: () => void) => {
      performanceMonitor.measure(`${componentName}-${name}`, fn);
    },
    measureAsyncInteraction: async <T>(name: string, fn: () => Promise<T>) => {
      return performanceMonitor.measureAsync(`${componentName}-${name}`, fn);
    },
  };
}

export default performanceMonitor;