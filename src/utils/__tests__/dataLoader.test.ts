/**
 * Unit tests for data loading utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadMountainData, DataLoadError } from '../dataLoader';

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
        width: 5000,
        country: 'Nepal/China',
        region: 'Himalayas',
      },
    ],
  };

  describe('loadMountainData', () => {
    it('should successfully load valid mountain data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(validMountainData),
      } as Response);

      const result = await loadMountainData();
      expect(result).toEqual(validMountainData.mountains);
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
      await expect(loadMountainData()).rejects.toThrow('Unexpected error loading mountain data');
    });
  });
});