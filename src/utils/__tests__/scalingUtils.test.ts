/**
 * Unit tests for scaling utilities
 * Requirements: 3.2, 3.3, 5.3
 */

import { describe, it, expect } from 'vitest';
import type { MountainWithCalculatedWidth } from '../../types';
import { MountainShape } from '../shapeCalculator';
import {
  calculateMaxDimensions,
  calculateContainerDimensions,
  calculateScaleFactor,
  createScaleConfig,
  generateTrianglePath,
  calculateScaledDimensions,
  calculateSVGViewBox,
} from '../scalingUtils';

// Test data
const testMountains: MountainWithCalculatedWidth[] = [
  {
    id: 'everest',
    name: 'Mount Everest',
    height: 8849,
    width: 5000,
    shape: MountainShape.CONICAL,
    country: 'Nepal/China',
    region: 'Himalayas',
  },
  {
    id: 'k2',
    name: 'K2',
    height: 8611,
    width: 4200,
    shape: MountainShape.CONICAL,
    country: 'Pakistan/China',
    region: 'Karakoram',
  },
  {
    id: 'denali',
    name: 'Denali',
    height: 6190,
    width: 3500,
    shape: MountainShape.DOME_SHAPED,
    country: 'USA',
    region: 'Alaska Range',
  },
];

describe('calculateMaxDimensions', () => {
  it('should calculate correct maximum dimensions from multiple mountains', () => {
    const result = calculateMaxDimensions(testMountains);
    
    expect(result.maxHeight).toBe(8849); // Mount Everest
    expect(result.maxWidth).toBe(5000);  // Mount Everest
  });

  it('should handle single mountain', () => {
    const singleMountain = [testMountains[0]];
    const result = calculateMaxDimensions(singleMountain);
    
    expect(result.maxHeight).toBe(8849);
    expect(result.maxWidth).toBe(5000);
  });

  it('should return zero dimensions for empty array', () => {
    const result = calculateMaxDimensions([]);
    
    expect(result.maxHeight).toBe(0);
    expect(result.maxWidth).toBe(0);
  });

  it('should handle mountains with same dimensions', () => {
    const sameMountains: MountainWithCalculatedWidth[] = [
      { id: '1', name: 'Mountain 1', height: 1000, width: 500, shape: MountainShape.CONICAL },
      { id: '2', name: 'Mountain 2', height: 1000, width: 500, shape: MountainShape.CONICAL },
    ];
    
    const result = calculateMaxDimensions(sameMountains);
    
    expect(result.maxHeight).toBe(1000);
    expect(result.maxWidth).toBe(500);
  });
});

describe('calculateContainerDimensions', () => {
  it('should calculate container dimensions with default padding', () => {
    const result = calculateContainerDimensions(1200, 800);
    
    // For viewport 1200x800: reservedWidth=300, reservedHeight=240, padding=40
    // containerWidth = max(500, 1200 - 300 - 80) = max(500, 820) = 820
    // containerHeight = max(300, 800 - 240 - 80) = max(300, 480) = 480
    expect(result.containerWidth).toBe(820);
    expect(result.containerHeight).toBe(480);
  });

  it('should calculate container dimensions with custom padding', () => {
    const result = calculateContainerDimensions(1200, 800, 60);
    
    // For viewport 1200x800: reservedWidth=300, reservedHeight=240, padding=60
    // containerWidth = max(500, 1200 - 300 - 120) = max(500, 780) = 780
    // containerHeight = max(300, 800 - 240 - 120) = max(300, 440) = 440
    expect(result.containerWidth).toBe(780);
    expect(result.containerHeight).toBe(440);
  });

  it('should enforce minimum dimensions', () => {
    const result = calculateContainerDimensions(400, 300);
    
    // For viewport 400x300 (mobile): reservedWidth=40, reservedHeight=180, padding=20 (capped)
    // containerWidth = max(280, 400 - 40 - 40) = max(280, 320) = 320
    // containerHeight = max(200, 300 - 180 - 40) = max(200, 80) = 200
    expect(result.containerWidth).toBe(320);
    expect(result.containerHeight).toBe(200);
  });

  it('should handle very small viewport', () => {
    const result = calculateContainerDimensions(100, 100);
    
    // For viewport 100x100 (mobile): reservedWidth=40, reservedHeight=180, padding=20 (capped)
    // containerWidth = max(280, 100 - 40 - 40) = max(280, 20) = 280
    // containerHeight = max(200, 100 - 180 - 40) = max(200, -120) = 200
    expect(result.containerWidth).toBe(280);
    expect(result.containerHeight).toBe(200);
  });
});

describe('calculateScaleFactor', () => {
  it('should calculate correct scale factor when width is limiting', () => {
    const maxDimensions = { maxHeight: 1000, maxWidth: 2000 };
    const containerDimensions = { containerWidth: 800, containerHeight: 600 };
    
    const result = calculateScaleFactor(maxDimensions, containerDimensions);
    
    // Available width: 800 * 0.8 = 640, scale = 640/2000 = 0.32
    // Available height: 600 * 0.8 = 480, scale = 480/1000 = 0.48
    // Should use smaller scale (width-limited)
    expect(result).toBeCloseTo(0.32, 2);
  });

  it('should calculate correct scale factor when height is limiting', () => {
    const maxDimensions = { maxHeight: 2000, maxWidth: 1000 };
    const containerDimensions = { containerWidth: 800, containerHeight: 600 };
    
    const result = calculateScaleFactor(maxDimensions, containerDimensions);
    
    // Available width: 800 * 0.8 = 640, scale = 640/1000 = 0.64
    // Available height: 600 * 0.8 = 480, scale = 480/2000 = 0.24
    // Should use smaller scale (height-limited)
    expect(result).toBeCloseTo(0.24, 2);
  });

  it('should handle custom margin ratio', () => {
    const maxDimensions = { maxHeight: 1000, maxWidth: 1000 };
    const containerDimensions = { containerWidth: 500, containerHeight: 500 };
    
    const result = calculateScaleFactor(maxDimensions, containerDimensions, 0.2);
    
    // Available space: 500 * 0.6 = 300, scale = 300/1000 = 0.3
    expect(result).toBeCloseTo(0.3, 2);
  });

  it('should return 0 for zero dimensions', () => {
    const maxDimensions = { maxHeight: 0, maxWidth: 1000 };
    const containerDimensions = { containerWidth: 500, containerHeight: 500 };
    
    const result = calculateScaleFactor(maxDimensions, containerDimensions);
    
    expect(result).toBe(0);
  });
});

describe('createScaleConfig', () => {
  it('should create complete scale configuration', () => {
    const result = createScaleConfig(testMountains, 1200, 800);
    
    expect(result.maxHeight).toBe(8849);
    expect(result.maxWidth).toBe(5000);
    expect(result.containerWidth).toBe(820);
    expect(result.containerHeight).toBe(480);
  });

  it('should handle empty mountains array', () => {
    const result = createScaleConfig([], 1200, 800);
    
    expect(result.maxHeight).toBe(0);
    expect(result.maxWidth).toBe(0);
    expect(result.containerWidth).toBe(820);
    expect(result.containerHeight).toBe(480);
  });

  it('should use custom padding', () => {
    const result = createScaleConfig(testMountains, 1200, 800, 60);
    
    expect(result.containerWidth).toBe(780);
    expect(result.containerHeight).toBe(440);
  });
});

describe('generateTrianglePath', () => {
  it('should generate correct SVG path for triangle', () => {
    const mountain: MountainWithCalculatedWidth = {
      id: 'test',
      name: 'Test Mountain',
      height: 100,
      width: 60,
      shape: MountainShape.CONICAL,
    };
    
    const result = generateTrianglePath(mountain, 2);
    
    // Scaled: height = 200, width = 120
    // Expected path: M 60 0 L 0 200 L 120 200 Z
    expect(result).toBe('M 60 0 L 0 200 L 120 200 Z');
  });

  it('should handle scale factor of 1', () => {
    const mountain: MountainWithCalculatedWidth = {
      id: 'test',
      name: 'Test Mountain',
      height: 50,
      width: 30,
      shape: MountainShape.CONICAL,
    };
    
    const result = generateTrianglePath(mountain, 1);
    
    expect(result).toBe('M 15 0 L 0 50 L 30 50 Z');
  });

  it('should handle fractional scale factors', () => {
    const mountain: MountainWithCalculatedWidth = {
      id: 'test',
      name: 'Test Mountain',
      height: 100,
      width: 80,
      shape: MountainShape.CONICAL,
    };
    
    const result = generateTrianglePath(mountain, 0.5);
    
    // Scaled: height = 50, width = 40
    expect(result).toBe('M 20 0 L 0 50 L 40 50 Z');
  });

  it('should handle zero scale factor', () => {
    const mountain: MountainWithCalculatedWidth = {
      id: 'test',
      name: 'Test Mountain',
      height: 100,
      width: 80,
      shape: MountainShape.CONICAL,
    };
    
    const result = generateTrianglePath(mountain, 0);
    
    expect(result).toBe('M 0 0 L 0 0 L 0 0 Z');
  });
});

describe('calculateScaledDimensions', () => {
  it('should calculate scaled dimensions correctly', () => {
    const mountain: MountainWithCalculatedWidth = {
      id: 'test',
      name: 'Test Mountain',
      height: 1000,
      width: 600,
      shape: MountainShape.CONICAL,
    };
    
    const result = calculateScaledDimensions(mountain, 0.5);
    
    expect(result.scaledHeight).toBe(500);
    expect(result.scaledWidth).toBe(300);
  });

  it('should handle scale factor of 1', () => {
    const mountain: MountainWithCalculatedWidth = {
      id: 'test',
      name: 'Test Mountain',
      height: 1000,
      width: 600,
      shape: MountainShape.CONICAL,
    };
    
    const result = calculateScaledDimensions(mountain, 1);
    
    expect(result.scaledHeight).toBe(1000);
    expect(result.scaledWidth).toBe(600);
  });

  it('should handle zero scale factor', () => {
    const mountain: MountainWithCalculatedWidth = {
      id: 'test',
      name: 'Test Mountain',
      height: 1000,
      width: 600,
      shape: MountainShape.CONICAL,
    };
    
    const result = calculateScaledDimensions(mountain, 0);
    
    expect(result.scaledHeight).toBe(0);
    expect(result.scaledWidth).toBe(0);
  });
});

describe('calculateSVGViewBox', () => {
  it('should calculate viewBox for multiple mountains', () => {
    const mountains: MountainWithCalculatedWidth[] = [
      { id: '1', name: 'Mountain 1', height: 100, width: 60, shape: MountainShape.CONICAL },
      { id: '2', name: 'Mountain 2', height: 80, width: 40, shape: MountainShape.CONICAL },
    ];
    
    const result = calculateSVGViewBox(mountains, 1, 10);
    
    // Total width: 60 + 40 + 10 = 110
    // Max height: 100
    expect(result).toBe('0 0 110 100');
  });

  it('should handle single mountain', () => {
    const mountains: MountainWithCalculatedWidth[] = [
      { id: '1', name: 'Mountain 1', height: 100, width: 60, shape: MountainShape.CONICAL },
    ];
    
    const result = calculateSVGViewBox(mountains, 1, 10);
    
    // Total width: 60 (no spacing for single mountain)
    // Max height: 100
    expect(result).toBe('0 0 60 100');
  });

  it('should handle empty array', () => {
    const result = calculateSVGViewBox([], 1, 10);
    
    expect(result).toBe('0 0 100 100');
  });

  it('should apply scale factor correctly', () => {
    const mountains: MountainWithCalculatedWidth[] = [
      { id: '1', name: 'Mountain 1', height: 100, width: 60, shape: MountainShape.CONICAL },
      { id: '2', name: 'Mountain 2', height: 80, width: 40, shape: MountainShape.CONICAL },
    ];
    
    const result = calculateSVGViewBox(mountains, 0.5, 10);
    
    // Scaled widths: 30 + 20 + 10 = 60
    // Max scaled height: 50
    expect(result).toBe('0 0 60 50');
  });

  it('should handle custom spacing', () => {
    const mountains: MountainWithCalculatedWidth[] = [
      { id: '1', name: 'Mountain 1', height: 100, width: 60, shape: MountainShape.CONICAL },
      { id: '2', name: 'Mountain 2', height: 80, width: 40, shape: MountainShape.CONICAL },
      { id: '3', name: 'Mountain 3', height: 90, width: 50, shape: MountainShape.CONICAL },
    ];
    
    const result = calculateSVGViewBox(mountains, 1, 25);
    
    // Total width: 60 + 40 + 50 + 2*25 = 200
    // Max height: 100
    expect(result).toBe('0 0 200 100');
  });
});