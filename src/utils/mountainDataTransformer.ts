/**
 * Mountain Data Transformer Utility
 * Processes raw mountain data and integrates shape calculator to add calculated width
 * Requirements: 2.3, 2.4, 4.1, 4.2, 4.3, 4.4
 */

import type { Mountain, MountainWithCalculatedWidth } from '../types/Mountain';
import { MountainShape, calculateWidthSafe } from './shapeCalculator';

/**
 * Interface for raw mountain data that may come from JSON files
 * This represents the transition state where data might have width or shape properties
 */
export interface RawMountainData {
  id: string;
  name: string;
  height: number;
  width?: number; // Legacy property that will be removed
  shape?: string; // New property for shape classification
  country?: string;
  region?: string;
}

/**
 * Error class for data transformation issues
 */
export class DataTransformationError extends Error {
  constructor(message: string, public mountainId?: string, public cause?: Error) {
    super(message);
    this.name = 'DataTransformationError';
  }
}

/**
 * Validates that a shape string is a valid MountainShape enum value
 * Requirements: 2.3, 2.4
 */
function isValidMountainShape(shape: string): shape is MountainShape {
  return Object.values(MountainShape).includes(shape as MountainShape);
}

/**
 * Transforms a single raw mountain data object into a Mountain with calculated width
 * Requirements: 2.3, 2.4, 4.1, 4.2, 4.3, 4.4
 */
export function transformMountainData(rawMountain: RawMountainData): MountainWithCalculatedWidth {
  try {
    // Validate required fields
    if (!rawMountain.id || typeof rawMountain.id !== 'string') {
      throw new DataTransformationError('Mountain must have a valid id', rawMountain.id);
    }

    if (!rawMountain.name || typeof rawMountain.name !== 'string') {
      throw new DataTransformationError('Mountain must have a valid name', rawMountain.id);
    }

    if (typeof rawMountain.height !== 'number' || rawMountain.height <= 0) {
      throw new DataTransformationError(
        `Mountain height must be a positive number, got: ${rawMountain.height}`,
        rawMountain.id
      );
    }

    // Handle shape property with fallback to conical
    let shape: MountainShape = MountainShape.CONICAL;
    
    if (rawMountain.shape) {
      if (isValidMountainShape(rawMountain.shape)) {
        shape = rawMountain.shape;
      } else {
        console.warn(
          `Invalid shape "${rawMountain.shape}" for mountain "${rawMountain.name}" (${rawMountain.id}). Defaulting to conical.`
        );
      }
    } else {
      console.warn(
        `Missing shape property for mountain "${rawMountain.name}" (${rawMountain.id}). Defaulting to conical.`
      );
    }

    // Calculate width using shape calculator
    const calculatedWidth = calculateWidthSafe(rawMountain.height, shape);

    // Create the transformed mountain object
    const transformedMountain: MountainWithCalculatedWidth = {
      id: rawMountain.id,
      name: rawMountain.name,
      height: rawMountain.height,
      shape: shape,
      width: calculatedWidth,
      country: rawMountain.country,
      region: rawMountain.region
    };

    return transformedMountain;

  } catch (error) {
    if (error instanceof DataTransformationError) {
      throw error;
    }
    
    throw new DataTransformationError(
      `Failed to transform mountain data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      rawMountain.id,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Transforms an array of raw mountain data into an array of Mountains with calculated widths
 * Requirements: 2.3, 2.4, 4.1, 4.2, 4.3, 4.4
 */
export function transformMountainDataArray(rawMountains: RawMountainData[]): MountainWithCalculatedWidth[] {
  if (!Array.isArray(rawMountains)) {
    throw new DataTransformationError('Input must be an array of mountain data');
  }

  const transformedMountains: MountainWithCalculatedWidth[] = [];
  const errors: DataTransformationError[] = [];

  rawMountains.forEach((rawMountain, index) => {
    try {
      const transformed = transformMountainData(rawMountain);
      transformedMountains.push(transformed);
    } catch (error) {
      const transformError = error instanceof DataTransformationError 
        ? error 
        : new DataTransformationError(
            `Error at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            rawMountain?.id
          );
      
      console.error(`Data transformation error for mountain at index ${index}:`, transformError);
      errors.push(transformError);
    }
  });

  // If we have some successful transformations, return them with warnings
  if (transformedMountains.length > 0) {
    if (errors.length > 0) {
      console.warn(`Successfully transformed ${transformedMountains.length} mountains, but encountered ${errors.length} errors`);
    }
    return transformedMountains;
  }

  // If no mountains were successfully transformed, throw an error
  throw new DataTransformationError(
    `Failed to transform any mountain data. Encountered ${errors.length} errors.`
  );
}

/**
 * Processes raw JSON data structure and transforms mountains
 * This function handles the typical JSON structure with a "mountains" array
 * Requirements: 2.3, 2.4, 4.1, 4.2, 4.3, 4.4
 */
export function processRawMountainData(data: unknown): MountainWithCalculatedWidth[] {
  if (!data || typeof data !== 'object') {
    throw new DataTransformationError('Data must be an object');
  }

  const obj = data as Record<string, unknown>;
  
  if (!('mountains' in obj)) {
    throw new DataTransformationError('Data must contain a "mountains" property');
  }

  if (!Array.isArray(obj.mountains)) {
    throw new DataTransformationError('Mountains property must be an array');
  }

  return transformMountainDataArray(obj.mountains as RawMountainData[]);
}

/**
 * Convenience function that combines data loading and transformation
 * This can be used as a drop-in replacement for existing data loading logic
 * Requirements: 2.3, 2.4, 4.1, 4.2, 4.3, 4.4
 */
export async function loadAndTransformMountainData(): Promise<MountainWithCalculatedWidth[]> {
  try {
    const response = await fetch('/mountains.json');
    
    if (!response.ok) {
      throw new DataTransformationError(
        `Failed to load mountain data: ${response.status} ${response.statusText}`
      );
    }

    const rawData = await response.json();
    return processRawMountainData(rawData);

  } catch (error) {
    if (error instanceof DataTransformationError) {
      throw error;
    }
    
    // Check for network/fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new DataTransformationError('Network error: Unable to fetch mountain data', undefined, error);
    }
    
    // Check for JSON parsing errors
    if (error instanceof SyntaxError) {
      throw new DataTransformationError('Invalid JSON format in mountain data', undefined, error);
    }
    
    throw new DataTransformationError(
      'Unexpected error loading and transforming mountain data',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}