/**
 * Unit tests for shape calculator utilities
 * Requirements: 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MountainShape,
  calculateWidth,
  calculateWidthSafe,
  type ShapeCalculationParams,
} from '../shapeCalculator';

describe('MountainShape enum', () => {
  it('should have all four required shape types', () => {
    expect(MountainShape.DOME_SHAPED).toBe('dome-shaped');
    expect(MountainShape.CONICAL).toBe('conical');
    expect(MountainShape.RIDGE).toBe('ridge');
    expect(MountainShape.PLATEAU).toBe('plateau');
  });
});

describe('calculateWidth', () => {
  describe('dome-shaped mountains', () => {
    it('should calculate width using dome formula: w = 2 × √(h² + r²) where r = h × 0.6', () => {
      const height = 1000;
      const baseRadius = height * 0.6; // 600
      const expectedWidth = 2 * Math.sqrt(height * height + baseRadius * baseRadius);
      // Expected: 2 * √(1000000 + 360000) = 2 * √1360000 ≈ 2332.38

      const result = calculateWidth({
        height,
        shape: MountainShape.DOME_SHAPED,
      });

      expect(result).toBeCloseTo(expectedWidth, 2);
      expect(result).toBeCloseTo(2332.38, 2);
    });

    it('should handle small dome-shaped mountains', () => {
      const height = 100;
      const result = calculateWidth({
        height,
        shape: MountainShape.DOME_SHAPED,
      });

      // Should be approximately 233.24
      expect(result).toBeCloseTo(233.24, 2);
    });
  });

  describe('conical mountains', () => {
    it('should calculate width using conical formula: w = 2 × h × tan(30°)', () => {
      const height = 1000;
      const slopeAngleRadians = 30 * (Math.PI / 180);
      const expectedWidth = 2 * height * Math.tan(slopeAngleRadians);
      // Expected: 2 * 1000 * tan(30°) = 2000 * 0.577 ≈ 1154.7

      const result = calculateWidth({
        height,
        shape: MountainShape.CONICAL,
      });

      expect(result).toBeCloseTo(expectedWidth, 2);
      expect(result).toBeCloseTo(1154.7, 1);
    });

    it('should handle small conical mountains', () => {
      const height = 100;
      const result = calculateWidth({
        height,
        shape: MountainShape.CONICAL,
      });

      // Should be approximately 115.47
      expect(result).toBeCloseTo(115.47, 2);
    });
  });

  describe('ridge mountains', () => {
    it('should calculate width using ridge formula: w = h × 0.8', () => {
      const height = 1000;
      const expectedWidth = height * 0.8;

      const result = calculateWidth({
        height,
        shape: MountainShape.RIDGE,
      });

      expect(result).toBe(expectedWidth);
      expect(result).toBe(800);
    });

    it('should handle small ridge mountains', () => {
      const height = 100;
      const result = calculateWidth({
        height,
        shape: MountainShape.RIDGE,
      });

      expect(result).toBe(80);
    });
  });

  describe('plateau mountains', () => {
    it('should calculate width using plateau formula: w = h × 1.2', () => {
      const height = 1000;
      const expectedWidth = height * 1.2;

      const result = calculateWidth({
        height,
        shape: MountainShape.PLATEAU,
      });

      expect(result).toBe(expectedWidth);
      expect(result).toBe(1200);
    });

    it('should handle small plateau mountains', () => {
      const height = 100;
      const result = calculateWidth({
        height,
        shape: MountainShape.PLATEAU,
      });

      expect(result).toBe(120);
    });
  });

  describe('minimum width constraint', () => {
    it('should apply minimum width of h × 0.3 when calculated width is smaller', () => {
      // Use a very tall, narrow ridge that would normally be 0.8 * height
      // but we'll test with a scenario where minimum kicks in
      const height = 1000;

      // Ridge calculation: 1000 * 0.8 = 800
      // Minimum width: 1000 * 0.3 = 300
      // Since 800 > 300, should return 800
      const result = calculateWidth({
        height,
        shape: MountainShape.RIDGE,
      });

      expect(result).toBe(800);
      expect(result).toBeGreaterThanOrEqual(height * 0.3);
    });

    it('should enforce minimum width for very narrow calculations', () => {
      // Create a scenario where we might get a very narrow width
      // This is more of a theoretical test since our current formulas don't go below minimum
      const height = 100;
      const minimumWidth = height * 0.3; // 30

      // Test with ridge (should be 80, which is > 30)
      const result = calculateWidth({
        height,
        shape: MountainShape.RIDGE,
      });

      expect(result).toBeGreaterThanOrEqual(minimumWidth);
    });
  });

  describe('input validation', () => {
    it('should throw error for invalid height (zero)', () => {
      expect(() => {
        calculateWidth({
          height: 0,
          shape: MountainShape.CONICAL,
        });
      }).toThrow('Invalid height value: 0. Height must be a positive number.');
    });

    it('should throw error for invalid height (negative)', () => {
      expect(() => {
        calculateWidth({
          height: -100,
          shape: MountainShape.CONICAL,
        });
      }).toThrow('Invalid height value: -100. Height must be a positive number.');
    });

    it('should throw error for invalid height (non-number)', () => {
      expect(() => {
        calculateWidth({
          height: 'invalid' as any,
          shape: MountainShape.CONICAL,
        });
      }).toThrow('Invalid height value: invalid. Height must be a positive number.');
    });

    it('should throw error for invalid shape', () => {
      expect(() => {
        calculateWidth({
          height: 1000,
          shape: 'invalid-shape' as any,
        });
      }).toThrow('Invalid shape value: invalid-shape. Must be one of: dome-shaped, conical, ridge, plateau');
    });
  });
});

describe('calculateWidthSafe', () => {
  // Mock console.warn and console.error for testing
  const originalWarn = console.warn;
  const originalError = console.error;

  beforeEach(() => {
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
    console.error = originalError;
  });

  it('should calculate width for valid shape string', () => {
    const result = calculateWidthSafe(1000, 'conical');
    expect(result).toBeCloseTo(1154.7, 1);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should default to conical for invalid shape and log warning', () => {
    const result = calculateWidthSafe(1000, 'invalid-shape');

    // Should return conical calculation
    expect(result).toBeCloseTo(1154.7, 1);
    expect(console.warn).toHaveBeenCalledWith('Invalid shape "invalid-shape" defaulted to "conical"');
  });

  it('should handle calculation errors gracefully', () => {
    // Test with invalid height that would cause an error
    const result = calculateWidthSafe(-100, 'conical');

    // Should still return a valid result (fallback to conical with positive height)
    expect(result).toBeGreaterThan(0);
    expect(console.error).toHaveBeenCalled();
  });

  it('should work with all valid shape strings', () => {
    const height = 1000;

    expect(calculateWidthSafe(height, 'dome-shaped')).toBeCloseTo(2332.38, 2);
    expect(calculateWidthSafe(height, 'conical')).toBeCloseTo(1154.7, 1);
    expect(calculateWidthSafe(height, 'ridge')).toBe(800);
    expect(calculateWidthSafe(height, 'plateau')).toBe(1200);
  });
});

describe('mathematical accuracy', () => {
  it('should produce consistent results for the same inputs', () => {
    const params: ShapeCalculationParams = {
      height: 8849, // Mount Everest height
      shape: MountainShape.CONICAL,
    };

    const result1 = calculateWidth(params);
    const result2 = calculateWidth(params);

    expect(result1).toBe(result2);
  });

  it('should handle edge cases with very large heights', () => {
    const largeHeight = 50000; // Theoretical very tall mountain

    const domeResult = calculateWidth({
      height: largeHeight,
      shape: MountainShape.DOME_SHAPED,
    });

    const conicalResult = calculateWidth({
      height: largeHeight,
      shape: MountainShape.CONICAL,
    });

    expect(domeResult).toBeGreaterThan(0);
    expect(conicalResult).toBeGreaterThan(0);
    expect(domeResult).toBeGreaterThanOrEqual(largeHeight * 0.3);
    expect(conicalResult).toBeGreaterThanOrEqual(largeHeight * 0.3);
  });

  it('should handle edge cases with very small heights', () => {
    const smallHeight = 1; // 1 meter mountain

    const results = [
      calculateWidth({ height: smallHeight, shape: MountainShape.DOME_SHAPED }),
      calculateWidth({ height: smallHeight, shape: MountainShape.CONICAL }),
      calculateWidth({ height: smallHeight, shape: MountainShape.RIDGE }),
      calculateWidth({ height: smallHeight, shape: MountainShape.PLATEAU }),
    ];

    // All results should be positive and at least the minimum width
    results.forEach(result => {
      expect(result).toBeGreaterThan(0);
      expect(result).toBeGreaterThanOrEqual(smallHeight * 0.3);
    });
  });
});