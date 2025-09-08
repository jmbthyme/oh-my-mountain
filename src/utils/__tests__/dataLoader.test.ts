/**
 * Unit tests for data loading utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadMountainData, DataLoadError } from '../dataLoader';
import { MountainShape } from '../shapeCalculator';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('dataLoader', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const validMountainData = {
    mountains: [
      {
        id: 'everest',
        name: 'Mount Everest',
        height: 8849,
        shape: MountainShape.CONICAL,
        country: 'Nepal/China',
        region: 'Himalayas',
      },
    ],
  };

  describe('loadMountainData', () => {
    it('should successfully load valid mountain data with calculated width', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(validMountainData),
      } as Response);

      const result = await loadMountainData();
      
      // Verify the structure includes calculated width
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'everest',
        name: 'Mount Everest',
        height: 8849,
        shape: MountainShape.CONICAL,
        country: 'Nepal/China',
        region: 'Himalayas',
      });
      expect(result[0]).toHaveProperty('width');
      expect(typeof result[0].width).toBe('number');
      expect(result[0].width).toBeGreaterThan(0);
      expect(mockFetch).toHaveBeenCalledWith('/mountains.json');
    });

    it('should throw DataLoadError for network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(loadMountainData()).rejects.toThrow(DataLoadError);
      // Just check that it throws a DataLoadError, the exact message may vary
      const error = await loadMountainData().catch(e => e);
      expect(error).toBeInstanceOf(DataLoadError);
    });

    it('should handle unexpected errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(loadMountainData()).rejects.toThrow(DataLoadError);
      await expect(loadMountainData()).rejects.toThrow('Data transformation failed: Unexpected error loading and transforming mountain data');
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({}),
      } as Response);

      await expect(loadMountainData()).rejects.toThrow(DataLoadError);
      const error = await loadMountainData().catch(e => e);
      expect(error.message).toContain('Data transformation failed');
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      } as Response);

      await expect(loadMountainData()).rejects.toThrow(DataLoadError);
      const error = await loadMountainData().catch(e => e);
      expect(error.message).toContain('Data transformation failed');
    });

    it('should handle data transformation errors', async () => {
      const invalidData = {
        mountains: [
          {
            id: 'invalid',
            // Missing required fields
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(invalidData),
      } as Response);

      await expect(loadMountainData()).rejects.toThrow(DataLoadError);
    });
  });
});