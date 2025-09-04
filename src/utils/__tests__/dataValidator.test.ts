/**
 * Unit tests for data validation utilities
 */

import { describe, it, expect } from 'vitest';
import { validateMountain, validateMountains, validateMountainData, ValidationError } from '../dataValidator';
import { Mountain } from '../../types/Mountain';

describe('dataValidator', () => {
  const validMountain: Mountain = {
    id: 'everest',
    name: 'Mount Everest',
    height: 8849,
    width: 5000,
    country: 'Nepal/China',
    region: 'Himalayas',
  };

  describe('validateMountain', () => {
    it('should validate a valid mountain object', () => {
      expect(() => validateMountain(validMountain)).not.toThrow();
    });

    it('should validate a mountain with only required fields', () => {
      const minimalMountain = {
        id: 'k2',
        name: 'K2',
        height: 8611,
        width: 4200,
      };
      expect(() => validateMountain(minimalMountain)).not.toThrow();
    });

    it('should throw ValidationError for non-object input', () => {
      expect(() => validateMountain(null)).toThrow(ValidationError);
      expect(() => validateMountain('string')).toThrow(ValidationError);
      expect(() => validateMountain(123)).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing required fields', () => {
      expect(() => validateMountain({})).toThrow(ValidationError);
      expect(() => validateMountain({ id: 'test' })).toThrow(ValidationError);
      expect(() => validateMountain({ id: 'test', name: 'Test' })).toThrow(ValidationError);
      expect(() => validateMountain({ id: 'test', name: 'Test', height: 100 })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid id', () => {
      expect(() => validateMountain({ ...validMountain, id: '' })).toThrow(ValidationError);
      expect(() => validateMountain({ ...validMountain, id: 123 })).toThrow(ValidationError);
      expect(() => validateMountain({ ...validMountain, id: null })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid name', () => {
      expect(() => validateMountain({ ...validMountain, name: '' })).toThrow(ValidationError);
      expect(() => validateMountain({ ...validMountain, name: 123 })).toThrow(ValidationError);
      expect(() => validateMountain({ ...validMountain, name: null })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid height', () => {
      expect(() => validateMountain({ ...validMountain, height: 0 })).toThrow(ValidationError);
      expect(() => validateMountain({ ...validMountain, height: -100 })).toThrow(ValidationError);
      expect(() => validateMountain({ ...validMountain, height: 'tall' })).toThrow(ValidationError);
      expect(() => validateMountain({ ...validMountain, height: NaN })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid width', () => {
      expect(() => validateMountain({ ...validMountain, width: 0 })).toThrow(ValidationError);
      expect(() => validateMountain({ ...validMountain, width: -100 })).toThrow(ValidationError);
      expect(() => validateMountain({ ...validMountain, width: 'wide' })).toThrow(ValidationError);
      expect(() => validateMountain({ ...validMountain, width: NaN })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid optional fields', () => {
      expect(() => validateMountain({ ...validMountain, country: 123 })).toThrow(ValidationError);
      expect(() => validateMountain({ ...validMountain, region: 123 })).toThrow(ValidationError);
    });

    it('should include index in error message when provided', () => {
      try {
        validateMountain({}, 5);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).message).toContain('at index 5');
        expect((error as ValidationError).index).toBe(5);
      }
    });
  });

  describe('validateMountains', () => {
    it('should validate an array of valid mountains', () => {
      const mountains = [validMountain, { ...validMountain, id: 'k2', name: 'K2' }];
      expect(() => validateMountains(mountains)).not.toThrow();
    });

    it('should throw ValidationError for non-array input', () => {
      expect(() => validateMountains({} as unknown[])).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty array', () => {
      expect(() => validateMountains([])).toThrow(ValidationError);
    });

    it('should throw ValidationError for duplicate IDs', () => {
      const mountains = [validMountain, validMountain];
      expect(() => validateMountains(mountains)).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid mountain in array', () => {
      const mountains = [validMountain, { id: 'invalid' }];
      expect(() => validateMountains(mountains)).toThrow(ValidationError);
    });
  });

  describe('validateMountainData', () => {
    it('should validate valid mountain data structure', () => {
      const data = { mountains: [validMountain] };
      const result = validateMountainData(data);
      expect(result).toEqual([validMountain]);
    });

    it('should throw ValidationError for non-object input', () => {
      expect(() => validateMountainData(null)).toThrow(ValidationError);
      expect(() => validateMountainData('string')).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing mountains property', () => {
      expect(() => validateMountainData({})).toThrow(ValidationError);
    });

    it('should throw ValidationError for non-array mountains property', () => {
      expect(() => validateMountainData({ mountains: 'not-array' })).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid mountains array', () => {
      expect(() => validateMountainData({ mountains: [] })).toThrow(ValidationError);
      expect(() => validateMountainData({ mountains: [{}] })).toThrow(ValidationError);
    });
  });
});