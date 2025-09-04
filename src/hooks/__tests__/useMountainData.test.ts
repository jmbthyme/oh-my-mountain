/**
 * Unit tests for useMountainData hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMountainData } from '../useMountainData';
import { DataLoadError } from '../../utils/dataLoader';

// Mock the dataLoader module
vi.mock('../../utils/dataLoader', () => ({
  loadMountainData: vi.fn(),
  DataLoadError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'DataLoadError';
    }
  },
}));

import { loadMountainData } from '../../utils/dataLoader';

const mockLoadMountainData = vi.mocked(loadMountainData);

describe('useMountainData', () => {
  const validMountains = [
    {
      id: 'everest',
      name: 'Mount Everest',
      height: 8849,
      width: 5000,
      country: 'Nepal/China',
      region: 'Himalayas',
    },
    {
      id: 'k2',
      name: 'K2',
      height: 8611,
      width: 4200,
      country: 'Pakistan/China',
      region: 'Karakoram',
    },
  ];

  beforeEach(() => {
    mockLoadMountainData.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with loading state', () => {
    mockLoadMountainData.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useMountainData());

    expect(result.current.loading).toBe(true);
    expect(result.current.mountains).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('should load mountains successfully', async () => {
    mockLoadMountainData.mockResolvedValueOnce(validMountains);

    const { result } = renderHook(() => useMountainData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.mountains).toEqual(validMountains);
    expect(result.current.error).toBe(null);
    expect(mockLoadMountainData).toHaveBeenCalledTimes(1);
  });

  it('should handle DataLoadError', async () => {
    const errorMessage = 'Failed to load mountain data';
    mockLoadMountainData.mockRejectedValueOnce(new DataLoadError(errorMessage));

    const { result } = renderHook(() => useMountainData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.mountains).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle unexpected errors', async () => {
    mockLoadMountainData.mockRejectedValueOnce(new Error('Unexpected error'));

    const { result } = renderHook(() => useMountainData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.mountains).toEqual([]);
    expect(result.current.error).toBe('An unexpected error occurred while loading mountain data');
  });

  it('should retry loading data when retry is called', async () => {
    // First call fails
    mockLoadMountainData.mockRejectedValueOnce(new DataLoadError('Network error'));
    
    const { result } = renderHook(() => useMountainData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(mockLoadMountainData).toHaveBeenCalledTimes(1);

    // Second call succeeds
    mockLoadMountainData.mockResolvedValueOnce(validMountains);
    
    result.current.retry();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.mountains).toEqual(validMountains);
    });
    
    expect(result.current.error).toBe(null);
    expect(mockLoadMountainData).toHaveBeenCalledTimes(2);
  });

  it('should reset error state when retrying', async () => {
    // First call fails
    mockLoadMountainData.mockRejectedValueOnce(new DataLoadError('Network error'));
    
    const { result } = renderHook(() => useMountainData());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Retry with success
    mockLoadMountainData.mockResolvedValueOnce(validMountains);
    
    result.current.retry();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(null);
    });
    
    expect(result.current.mountains).toEqual(validMountains);
  });
});