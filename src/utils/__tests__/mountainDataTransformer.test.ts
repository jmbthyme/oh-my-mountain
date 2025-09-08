/**
 * Unit tests for mountain data transformer utilities
 * Requirements: 2.3, 2.4, 4.1, 4.2, 4.3, 4.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  transformMountainData,
  transformMountainDataArray,
  processRawMountainData,
  loadAndTransformMountainData,
  DataTransformationError,
  type RawMountainData,
} from '../mountainDataTransformer';
import { MountainShape } from '../shapeCalculator';

// Mock the shape calculator
vi.mock('../shapeCalculator', async () => {
  const actual = await vi.importActual('../shapeCalculator');
  return {
    ...actual,
    calculateWidthSafe: vi.fn((height: number, shape: string) => {
      // Simple mock implementation for testing
      switch (shape) {
        case 'dome-shaped':
          return height * 2.33; // Approximate dome calculation
        case 'conical':
          return height * 1.15; // Approximate conical calculation
        case 'ridge':
          return height * 0.8;
        case 'plateau':
          return height * 1.2;
        default:
          return height * 1.15; // Default to conical
      }
    }),
  };
});

describe('mountainDataTransformer', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('transformMountainData', () => {
    it('should transform valid mountain data with shape property', () => {
      const rawMountain: RawMountainData = {
        id: 'everest',
        name: 'Mount Everest',
        height: 8849,
        shape: 'conical',
        country: 'Nepal/China',
        region: 'Himalayas',
      };

      const result = transformMountainData(rawMountain);

      expect(result).toEqual({
        id: 'everest',
        name: 'Mount Everest',
        height: 8849,
        shape: MountainShape.CONICAL,
        width: 8849 * 1.15, // Mocked calculation
        country: 'Nepal/China',
        region: 'Himalayas',
      });
    });

    it('should handle missing shape property and default to conical', () => {
      const rawMountain: RawMountainData = {
        id: 'test-mountain',
        name: 'Test Mountain',
        height: 1000,
        country: 'Test Country',
      };

      const result = transformMountainData(rawMountain);

      expect(result.shape).toBe(MountainShape.CONICAL);
      expect(result.width).toBe(1000 * 1.15); // Mocked conical calculation
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Missing shape property for mountain "Test Mountain" (test-mountain). Defaulting to conical.'
      );
    });

    it('should handle invalid shape property and default to conical', () => {
      const rawMountain: RawMountainData = {
        id: 'test-mountain',
        name: 'Test Mountain',
        height: 1000,
        shape: 'invalid-shape',
      };

      const result = transformMountainData(rawMountain);

      expect(result.shape).toBe(MountainShape.CONICAL);
      expect(result.width).toBe(1000 * 1.15); // Mocked conical calculation
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid shape "invalid-shape" for mountain "Test Mountain" (test-mountain). Defaulting to conical.'
      );
    });

    it('should handle all valid mountain shapes', () => {
      const shapes = [
        { shape: 'dome-shaped', expectedEnum: MountainShape.DOME_SHAPED, expectedMultiplier: 2.33 },
        { shape: 'conical', expectedEnum: MountainShape.CONICAL, expectedMultiplier: 1.15 },
        { shape: 'ridge', expectedEnum: MountainShape.RIDGE, expectedMultiplier: 0.8 },
        { shape: 'plateau', expectedEnum: MountainShape.PLATEAU, expectedMultiplier: 1.2 },
      ];

      shapes.forEach(({ shape, expectedEnum, expectedMultiplier }) => {
        const rawMountain: RawMountainData = {
          id: `test-${shape}`,
          name: `Test ${shape} Mountain`,
          height: 1000,
          shape,
        };

        const result = transformMountainData(rawMountain);

        expect(result.shape).toBe(expectedEnum);
        expect(result.width).toBe(1000 * expectedMultiplier);
      });
    });

    it('should handle optional country and region fields', () => {
      const rawMountain: RawMountainData = {
        id: 'test-mountain',
        name: 'Test Mountain',
        height: 1000,
        shape: 'conical',
      };

      const result = transformMountainData(rawMountain);

      expect(result.country).toBeUndefined();
      expect(result.region).toBeUndefined();
    });

    it('should throw DataTransformationError for missing id', () => {
      const rawMountain = {
        name: 'Test Mountain',
        height: 1000,
        shape: 'conical',
      } as RawMountainData;

      expect(() => transformMountainData(rawMountain)).toThrow(DataTransformationError);
      expect(() => transformMountainData(rawMountain)).toThrow('Mountain must have a valid id');
    });

    it('should throw DataTransformationError for invalid id', () => {
      const rawMountain = {
        id: '',
        name: 'Test Mountain',
        height: 1000,
        shape: 'conical',
      } as RawMountainData;

      expect(() => transformMountainData(rawMountain)).toThrow(DataTransformationError);
    });

    it('should throw DataTransformationError for missing name', () => {
      const rawMountain = {
        id: 'test-mountain',
        height: 1000,
        shape: 'conical',
      } as RawMountainData;

      expect(() => transformMountainData(rawMountain)).toThrow(DataTransformationError);
      expect(() => transformMountainData(rawMountain)).toThrow('Mountain must have a valid name');
    });

    it('should throw DataTransformationError for invalid height', () => {
      const rawMountain: RawMountainData = {
        id: 'test-mountain',
        name: 'Test Mountain',
        height: -100,
        shape: 'conical',
      };

      expect(() => transformMountainData(rawMountain)).toThrow(DataTransformationError);
      expect(() => transformMountainData(rawMountain)).toThrow('Mountain height must be a positive number');
    });

    it('should throw DataTransformationError for zero height', () => {
      const rawMountain: RawMountainData = {
        id: 'test-mountain',
        name: 'Test Mountain',
        height: 0,
        shape: 'conical',
      };

      expect(() => transformMountainData(rawMountain)).toThrow(DataTransformationError);
    });
  });

  describe('transformMountainDataArray', () => {
    it('should transform an array of valid mountain data', () => {
      const rawMountains: RawMountainData[] = [
        {
          id: 'everest',
          name: 'Mount Everest',
          height: 8849,
          shape: 'conical',
        },
        {
          id: 'k2',
          name: 'K2',
          height: 8611,
          shape: 'dome-shaped',
        },
      ];

      const result = transformMountainDataArray(rawMountains);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('everest');
      expect(result[0].shape).toBe(MountainShape.CONICAL);
      expect(result[1].id).toBe('k2');
      expect(result[1].shape).toBe(MountainShape.DOME_SHAPED);
    });

    it('should handle mixed valid and invalid data', () => {
      const rawMountains: RawMountainData[] = [
        {
          id: 'everest',
          name: 'Mount Everest',
          height: 8849,
          shape: 'conical',
        },
        {
          id: '',
          name: 'Invalid Mountain',
          height: 1000,
          shape: 'conical',
        } as RawMountainData,
        {
          id: 'k2',
          name: 'K2',
          height: 8611,
          shape: 'dome-shaped',
        },
      ];

      const result = transformMountainDataArray(rawMountains);

      expect(result).toHaveLength(2); // Only valid mountains
      expect(result[0].id).toBe('everest');
      expect(result[1].id).toBe('k2');
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Successfully transformed 2 mountains, but encountered 1 errors')
      );
    });

    it('should throw error if no mountains can be transformed', () => {
      const rawMountains: RawMountainData[] = [
        {
          id: '',
          name: 'Invalid Mountain 1',
          height: 1000,
        } as RawMountainData,
        {
          id: 'invalid-2',
          name: '',
          height: 1000,
        } as RawMountainData,
      ];

      expect(() => transformMountainDataArray(rawMountains)).toThrow(DataTransformationError);
      expect(() => transformMountainDataArray(rawMountains)).toThrow(
        'Failed to transform any mountain data'
      );
    });

    it('should throw error for non-array input', () => {
      expect(() => transformMountainDataArray({} as any)).toThrow(DataTransformationError);
      expect(() => transformMountainDataArray({} as any)).toThrow('Input must be an array');
    });

    it('should handle empty array', () => {
      expect(() => transformMountainDataArray([])).toThrow(DataTransformationError);
    });
  });

  describe('processRawMountainData', () => {
    it('should process valid JSON structure with mountains array', () => {
      const rawData = {
        mountains: [
          {
            id: 'everest',
            name: 'Mount Everest',
            height: 8849,
            shape: 'conical',
          },
        ],
      };

      const result = processRawMountainData(rawData);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('everest');
    });

    it('should throw error for non-object input', () => {
      expect(() => processRawMountainData(null)).toThrow(DataTransformationError);
      expect(() => processRawMountainData('invalid')).toThrow('Data must be an object');
    });

    it('should throw error for missing mountains property', () => {
      const rawData = { peaks: [] };

      expect(() => processRawMountainData(rawData)).toThrow(DataTransformationError);
      expect(() => processRawMountainData(rawData)).toThrow('Data must contain a "mountains" property');
    });

    it('should throw error for non-array mountains property', () => {
      const rawData = { mountains: 'not-an-array' };

      expect(() => processRawMountainData(rawData)).toThrow(DataTransformationError);
      expect(() => processRawMountainData(rawData)).toThrow('Mountains property must be an array');
    });
  });

  describe('loadAndTransformMountainData', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      fetchSpy = vi.spyOn(global, 'fetch');
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('should successfully load and transform mountain data', async () => {
      const mockData = {
        mountains: [
          {
            id: 'everest',
            name: 'Mount Everest',
            height: 8849,
            shape: 'conical',
          },
        ],
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response);

      const result = await loadAndTransformMountainData();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('everest');
      expect(fetchSpy).toHaveBeenCalledWith('/mountains.json');
    });

    it('should handle fetch network errors', async () => {
      fetchSpy.mockRejectedValueOnce(new TypeError('fetch is not defined'));

      try {
        await loadAndTransformMountainData();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(DataTransformationError);
        expect((error as DataTransformationError).message).toContain('Network error');
      }
    });

    it('should handle HTTP errors', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      try {
        await loadAndTransformMountainData();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(DataTransformationError);
        expect((error as DataTransformationError).message).toContain('Failed to load mountain data: 404 Not Found');
      }
    });

    it('should handle JSON parsing errors', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      } as Response);

      try {
        await loadAndTransformMountainData();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(DataTransformationError);
        expect((error as DataTransformationError).message).toContain('Invalid JSON format');
      }
    });

    it('should handle transformation errors', async () => {
      const mockData = {
        mountains: [
          {
            id: '',
            name: 'Invalid Mountain',
            height: 1000,
          },
        ],
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response);

      await expect(loadAndTransformMountainData()).rejects.toThrow(DataTransformationError);
    });
  });

  describe('DataTransformationError', () => {
    it('should create error with message and optional mountainId', () => {
      const error = new DataTransformationError('Test error', 'mountain-id');

      expect(error.message).toBe('Test error');
      expect(error.mountainId).toBe('mountain-id');
      expect(error.name).toBe('DataTransformationError');
    });

    it('should create error with cause', () => {
      const cause = new Error('Original error');
      const error = new DataTransformationError('Test error', 'mountain-id', cause);

      expect(error.cause).toBe(cause);
    });
  });
});