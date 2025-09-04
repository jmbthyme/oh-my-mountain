/**
 * Data loading utilities for mountain data
 * Requirements: 1.1, 1.3, 5.1
 */

import { Mountain } from '../types/Mountain';
import { validateMountainData, ValidationError } from './dataValidator';

export class DataLoadError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DataLoadError';
  }
}

/**
 * Loads mountain data from the public JSON file
 * @returns Promise that resolves to array of Mountain objects
 * @throws DataLoadError if loading or parsing fails
 */
export async function loadMountainData(): Promise<Mountain[]> {
  try {
    const response = await fetch('/mountains.json');
    
    if (!response.ok) {
      throw new DataLoadError(
        `Failed to load mountain data: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    // Validate the loaded data
    const validatedMountains = validateMountainData(data);
    
    return validatedMountains;
  } catch (error) {
    if (error instanceof DataLoadError) {
      throw error;
    }
    
    if (error instanceof ValidationError) {
      throw new DataLoadError(`Data validation failed: ${error.message}`, error);
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