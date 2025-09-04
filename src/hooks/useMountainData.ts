/**
 * Custom hook for loading mountain data with loading and error states
 * Requirements: 1.1, 1.3, 5.1, 5.4
 */

import { useState, useEffect } from 'react';
import { Mountain } from '../types/Mountain';
import { loadMountainData, DataLoadError } from '../utils/dataLoader';

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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await loadMountainData();
      setMountains(data);
    } catch (err) {
      if (err instanceof DataLoadError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while loading mountain data');
      }
      setMountains([]);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    mountains,
    loading,
    error,
    retry,
  };
}