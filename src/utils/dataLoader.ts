/**
 * Data loading utilities for mountain data
 * Requirements: 1.1, 1.3, 5.1, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4
 */

import type { MountainWithCalculatedWidth } from '../types/Mountain';
import { loadAndTransformMountainData, DataTransformationError } from './mountainDataTransformer';

export class DataLoadError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DataLoadError';
  }
}

/**
 * Loads mountain data from the public JSON file with calculated widths
 * @returns Promise that resolves to array of MountainWithCalculatedWidth objects
 * @throws DataLoadError if loading, parsing, or transformation fails
 */
export async function loadMountainData(): Promise<MountainWithCalculatedWidth[]> {
  try {
    // Use the data transformer which handles loading, validation, and width calculation
    const mountainsWithCalculatedWidth = await loadAndTransformMountainData();
    
    return mountainsWithCalculatedWidth;
  } catch (error) {
    if (error instanceof DataLoadError) {
      throw error;
    }
    
    if (error instanceof DataTransformationError) {
      throw new DataLoadError(`Data transformation failed: ${error.message}`, error);
    }
    
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      throw new DataLoadError('Network error: Unable to fetch mountain data', error);
    }
    
    if (error instanceof SyntaxError) {
      throw new DataLoadError('Invalid JSON format in mountain data', error);
    }
    
    throw new DataLoadError('Unexpected error loading mountain data', error as Error);
  }
}