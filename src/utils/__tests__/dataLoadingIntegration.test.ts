/**
 * Integration tests for data loading pipeline
 * Tests the complete flow from raw JSON data to transformed mountains with calculated widths
 * Requirements: 2.3, 2.4, 4.1, 4.2, 4.3, 4.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadMountainData, DataLoadError } from '../dataLoader';
import { MountainShape } from '../shapeCalculator';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Data Loading Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Complete data loading pipeline', () => {
    it('should load and transform mountain data with all shape types', async () => {
      const testData = {
        mountains: [
          {
            id: 'everest',
            name: 'Mount Everest',
            height: 8849,
            shape: MountainShape.CONICAL,
            country: 'Nepal/China',
            region: 'Himalayas',
          },
          {
            id: 'mont-blanc',
            name: 'Mont Blanc',
            height: 4809,
            shape: MountainShape.DOME_SHAPED,
            country: 'France/Italy',
            region: 'Alps',
          },
          {
            id: 'broad-peak',
            name: 'Broad Peak',
            height: 8051,
            shape: MountainShape.RIDGE,
            country: 'Pakistan/China',
            region: 'Karakoram',
          },
          {
            id: 'aneto',
            name: 'Aneto',
            height: 3404,
            shape: MountainShape.PLATEAU,
            country: 'Spain',
            region: 'Pyrenees',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testData),
      } as Response);

      const result = await loadMountainData();

      // Verify all mountains are loaded
      expect(result).toHaveLength(4);

      // Verify each mountain has calculated width
      result.forEach((mountain) => {
        expect(mountain).toHaveProperty('width');
        expect(typeof mountain.width).toBe('number');
        expect(mountain.width).toBeGreaterThan(0);
        
        // Verify minimum width constraint (width >= height * 0.3)
        expect(mountain.width).toBeGreaterThanOrEqual(mountain.height * 0.3);
      });

      // Verify specific calculations for different shapes
      const everest = result.find(m => m.id === 'everest');
      const montBlanc = result.find(m => m.id === 'mont-blanc');
      const broadPeak = result.find(m => m.id === 'broad-peak');
      const aneto = result.find(m => m.id === 'aneto');

      expect(everest).toBeDefined();
      expect(montBlanc).toBeDefined();
      expect(broadPeak).toBeDefined();
      expect(aneto).toBeDefined();

      // Verify different shapes produce different width calculations
      expect(everest!.width).not.toBe(montBlanc!.width);
      expect(broadPeak!.width).not.toBe(aneto!.width);
    });

    it('should handle missing shape property with fallback to conical', async () => {
      const testData = {
        mountains: [
          {
            id: 'test-mountain',
            name: 'Test Mountain',
            height: 5000,
            // Missing shape property
            country: 'Test Country',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testData),
      } as Response);

      const result = await loadMountainData();

      expect(result).toHaveLength(1);
      expect(result[0].shape).toBe(MountainShape.CONICAL);
      expect(result[0]).toHaveProperty('width');
      expect(result[0].width).toBeGreaterThan(0);
    });

    it('should handle invalid shape property with fallback to conical', async () => {
      const testData = {
        mountains: [
          {
            id: 'test-mountain',
            name: 'Test Mountain',
            height: 5000,
            shape: 'invalid-shape-type',
            country: 'Test Country',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testData),
      } as Response);

      const result = await loadMountainData();

      expect(result).toHaveLength(1);
      expect(result[0].shape).toBe(MountainShape.CONICAL);
      expect(result[0]).toHaveProperty('width');
      expect(result[0].width).toBeGreaterThan(0);
    });

    it('should handle shape calculation failures gracefully', async () => {
      const testData = {
        mountains: [
          {
            id: 'zero-height',
            name: 'Zero Height Mountain',
            height: 0, // Invalid height
            shape: MountainShape.CONICAL,
          },
          {
            id: 'valid-mountain',
            name: 'Valid Mountain',
            height: 1000,
            shape: MountainShape.DOME_SHAPED,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testData),
      } as Response);

      // Should return only the valid mountain, skipping the invalid one
      const result = await loadMountainData();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('valid-mountain');
      expect(result[0].height).toBe(1000);
      expect(result[0]).toHaveProperty('width');
    });

    it('should preserve all mountain metadata during transformation', async () => {
      const testData = {
        mountains: [
          {
            id: 'detailed-mountain',
            name: 'Detailed Mountain',
            height: 7000,
            shape: MountainShape.RIDGE,
            country: 'Test Country',
            region: 'Test Region',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testData),
      } as Response);

      const result = await loadMountainData();

      expect(result).toHaveLength(1);
      const mountain = result[0];
      
      expect(mountain.id).toBe('detailed-mountain');
      expect(mountain.name).toBe('Detailed Mountain');
      expect(mountain.height).toBe(7000);
      expect(mountain.shape).toBe(MountainShape.RIDGE);
      expect(mountain.country).toBe('Test Country');
      expect(mountain.region).toBe('Test Region');
      expect(mountain).toHaveProperty('width');
    });

    it('should handle empty mountains array', async () => {
      const testData = {
        mountains: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testData),
      } as Response);

      await expect(loadMountainData()).rejects.toThrow(DataLoadError);
    });

    it('should handle malformed JSON structure', async () => {
      const testData = {
        // Missing mountains property
        data: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testData),
      } as Response);

      await expect(loadMountainData()).rejects.toThrow(DataLoadError);
    });

    it('should ensure calculated widths are consistent for same mountain data', async () => {
      const testData = {
        mountains: [
          {
            id: 'consistent-test',
            name: 'Consistent Test Mountain',
            height: 6000,
            shape: MountainShape.CONICAL,
          },
        ],
      };

      // Load the same data multiple times
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(testData),
      } as Response);

      const result1 = await loadMountainData();
      const result2 = await loadMountainData();

      expect(result1[0].width).toBe(result2[0].width);
    });
  });

  describe('Error handling in data loading pipeline', () => {
    it('should provide detailed error messages for transformation failures', async () => {
      const testData = {
        mountains: [
          {
            id: 'invalid-mountain',
            name: 'Invalid Mountain',
            height: 'not-a-number', // Invalid height type
            shape: MountainShape.CONICAL,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(testData),
      } as Response);

      try {
        await loadMountainData();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(DataLoadError);
        expect((error as DataLoadError).message).toContain('transformation failed');
      }
    });

    it('should handle network timeouts and connection errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));

      try {
        await loadMountainData();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(DataLoadError);
        expect((error as DataLoadError).message).toContain('Data transformation failed');
      }
    });
  });
});