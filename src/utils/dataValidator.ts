/**
 * Data validation utilities for mountain data
 * Requirements: 1.1, 1.3, 6.5
 */

import { Mountain } from '../types/Mountain';

export class ValidationError extends Error {
  constructor(message: string, public field?: string, public index?: number) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates that a value is a non-empty string
 */
function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates that a value is a positive number
 */
function isValidPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validates that a value is an optional string (undefined or valid string)
 */
function isValidOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isValidString(value);
}

/**
 * Validates a single mountain object
 * @param mountain - Object to validate as Mountain
 * @param index - Optional index for error reporting
 * @throws ValidationError if validation fails
 */
export function validateMountain(mountain: unknown, index?: number): asserts mountain is Mountain {
  if (!mountain || typeof mountain !== 'object') {
    throw new ValidationError(
      `Mountain must be an object${index !== undefined ? ` at index ${index}` : ''}`,
      'mountain',
      index
    );
  }

  const obj = mountain as Record<string, unknown>;

  // Validate required fields
  if (!isValidString(obj.id)) {
    throw new ValidationError(
      `Mountain id must be a non-empty string${index !== undefined ? ` at index ${index}` : ''}`,
      'id',
      index
    );
  }

  if (!isValidString(obj.name)) {
    throw new ValidationError(
      `Mountain name must be a non-empty string${index !== undefined ? ` at index ${index}` : ''}`,
      'name',
      index
    );
  }

  if (!isValidPositiveNumber(obj.height)) {
    throw new ValidationError(
      `Mountain height must be a positive number${index !== undefined ? ` at index ${index}` : ''}`,
      'height',
      index
    );
  }

  if (!isValidPositiveNumber(obj.width)) {
    throw new ValidationError(
      `Mountain width must be a positive number${index !== undefined ? ` at index ${index}` : ''}`,
      'width',
      index
    );
  }

  // Validate optional fields
  if (!isValidOptionalString(obj.country)) {
    throw new ValidationError(
      `Mountain country must be a string or undefined${index !== undefined ? ` at index ${index}` : ''}`,
      'country',
      index
    );
  }

  if (!isValidOptionalString(obj.region)) {
    throw new ValidationError(
      `Mountain region must be a string or undefined${index !== undefined ? ` at index ${index}` : ''}`,
      'region',
      index
    );
  }
}

/**
 * Validates an array of mountain objects
 * @param mountains - Array to validate
 * @throws ValidationError if validation fails
 */
export function validateMountains(mountains: unknown[]): asserts mountains is Mountain[] {
  if (!Array.isArray(mountains)) {
    throw new ValidationError('Mountains data must be an array');
  }

  if (mountains.length === 0) {
    throw new ValidationError('Mountains array cannot be empty');
  }

  // Validate each mountain and check for duplicate IDs
  const seenIds = new Set<string>();
  
  mountains.forEach((mountain, index) => {
    validateMountain(mountain, index);
    
    const validatedMountain = mountain as Mountain;
    if (seenIds.has(validatedMountain.id)) {
      throw new ValidationError(
        `Duplicate mountain ID "${validatedMountain.id}" at index ${index}`,
        'id',
        index
      );
    }
    seenIds.add(validatedMountain.id);
  });
}

/**
 * Validates and returns mountain data, throwing detailed errors if invalid
 * @param data - Raw data to validate
 * @returns Validated mountain array
 * @throws ValidationError if validation fails
 */
export function validateMountainData(data: unknown): Mountain[] {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Data must be an object');
  }

  const obj = data as Record<string, unknown>;
  
  if (!('mountains' in obj)) {
    throw new ValidationError('Data must contain a "mountains" property');
  }

  if (!Array.isArray(obj.mountains)) {
    throw new ValidationError('Mountains property must be an array');
  }

  validateMountains(obj.mountains);
  return obj.mountains as Mountain[];
}