/**
 * Custom hook for loading mountain data with loading and error states
 * Requirements: 1.1, 1.3, 5.1, 5.4
 * Performance: Includes caching and lazy loading optimizations
 */

import { useState, useEffect, useRef } from 'react';
import type { Mountain } from '../types/Mountain';
import { loadMountainData, DataLoadError } from '../utils/dataLoader';
import { measurePerformance } from '../utils/performanceMonitor';

// Cache for mountain data to avoid repeated network requests
let mountainDataCache: Mountain[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface UseMountainDataResult {
  /** Array of loaded mountains */
  mountains: Mountain[];
  /** Loading state indicator */
  loading: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Function to retry loading data */
  retry: () => void;
}

/**
 * Custom hook that loads mountain data and manages loading/error states
 * @returns Object containing mountains, loading state, error, and retry function
 */
export function useMountainData(): UseMountainDataResult {
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Check cache first (unless force refresh)
      const now = Date.now();
      if (!forceRefresh && mountainDataCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
        setMountains(mountainDataCache);
        setLoading(false);
        return;
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const data = await measurePerformance.measureAsync('data-loading', () => loadMountainData());
      
      // Update cache
      mountainDataCache = data;
      cacheTimestamp = now;
      
      setMountains(data);
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      if (err instanceof DataLoadError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while loading mountain data');
      }
      setMountains([]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const retry = () => {
    loadData(true); // Force refresh on retry
  };

  useEffect(() => {
    loadData();

    // Cleanup function to abort request if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    mountains,
    loading,
    error,
    retry,
  };
}