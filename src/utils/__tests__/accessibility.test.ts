import { describe, it, expect } from 'vitest';
import { 
  generateAccessibilityIds, 
  buildMountainAriaAttributes, 
  generateMountainDescription, 
  buildMountainAriaLabel 
} from '../accessibility';

describe('Accessibility Utility Functions', () => {
  describe('generateAccessibilityIds', () => {
    it('should generate consistent IDs for a given mountain ID', () => {
      const mountainId = 'everest';
      const ids = generateAccessibilityIds(mountainId);
      
      expect(ids).toEqual({
        nameId: 'mountain-name-everest',
        detailsId: 'mountain-details-everest',
        checkboxId: 'mountain-checkbox-everest',
      });
    });

    it('should handle special characters in mountain IDs', () => {
      const mountainId = 'k2-peak';
      const ids = generateAccessibilityIds(mountainId);
      
      expect(ids).toEqual({
        nameId: 'mountain-name-k2-peak',
        detailsId: 'mountain-details-k2-peak',
        checkboxId: 'mountain-checkbox-k2-peak',
      });
    });

    it('should generate unique IDs for different mountains', () => {
      const ids1 = generateAccessibilityIds('mountain1');
      const ids2 = generateAccessibilityIds('mountain2');
      
      expect(ids1.nameId).not.toBe(ids2.nameId);
      expect(ids1.detailsId).not.toBe(ids2.detailsId);
      expect(ids1.checkboxId).not.toBe(ids2.checkboxId);
    });

    it('should handle empty string mountain ID', () => {
      const mountainId = '';
      const ids = generateAccessibilityIds(mountainId);
      
      expect(ids).toEqual({
        nameId: 'mountain-name-',
        detailsId: 'mountain-details-',
        checkboxId: 'mountain-checkbox-',
      });
    });

    it('should handle numeric mountain IDs', () => {
      const mountainId = '123';
      const ids = generateAccessibilityIds(mountainId);
      
      expect(ids).toEqual({
        nameId: 'mountain-name-123',
        detailsId: 'mountain-details-123',
        checkboxId: 'mountain-checkbox-123',
      });
    });
  });

  describe('buildMountainAriaAttributes', () => {
    it('should build checkbox role attributes when useCheckboxRole is true', () => {
      const attributes = buildMountainAriaAttributes({
        mountainId: 'everest',
        isSelected: true,
        isDisabled: false,
        useCheckboxRole: true,
      });
      
      expect(attributes).toEqual({
        role: 'checkbox',
        'aria-checked': true,
        'aria-labelledby': 'mountain-name-everest',
        'aria-describedby': 'mountain-details-everest',
        'aria-disabled': false,
        tabIndex: 0,
      });
    });

    it('should build button role attributes when useCheckboxRole is false', () => {
      const attributes = buildMountainAriaAttributes({
        mountainId: 'everest',
        isSelected: true,
        isDisabled: false,
        useCheckboxRole: false,
      });
      
      expect(attributes).toEqual({
        role: 'button',
        'aria-pressed': true,
        'aria-disabled': false,
        tabIndex: 0,
      });
    });

    it('should set tabIndex to -1 when disabled', () => {
      const attributes = buildMountainAriaAttributes({
        mountainId: 'everest',
        isSelected: false,
        isDisabled: true,
        useCheckboxRole: true,
      });
      
      expect(attributes.tabIndex).toBe(-1);
      expect(attributes['aria-disabled']).toBe(true);
    });

    it('should default to checkbox role when useCheckboxRole is not specified', () => {
      const attributes = buildMountainAriaAttributes({
        mountainId: 'everest',
        isSelected: false,
        isDisabled: false,
      });
      
      expect(attributes.role).toBe('checkbox');
      expect(attributes).toHaveProperty('aria-checked');
      expect(attributes).not.toHaveProperty('aria-pressed');
    });

    it('should handle unselected checkbox state correctly', () => {
      const attributes = buildMountainAriaAttributes({
        mountainId: 'k2',
        isSelected: false,
        isDisabled: false,
        useCheckboxRole: true,
      });
      
      expect(attributes).toEqual({
        role: 'checkbox',
        'aria-checked': false,
        'aria-labelledby': 'mountain-name-k2',
        'aria-describedby': 'mountain-details-k2',
        'aria-disabled': false,
        tabIndex: 0,
      });
    });

    it('should handle disabled button role correctly', () => {
      const attributes = buildMountainAriaAttributes({
        mountainId: 'kangchenjunga',
        isSelected: false,
        isDisabled: true,
        useCheckboxRole: false,
      });
      
      expect(attributes).toEqual({
        role: 'button',
        'aria-pressed': false,
        'aria-disabled': true,
        tabIndex: -1,
      });
    });
  });

  describe('generateMountainDescription', () => {
    it('should generate description with height and width', () => {
      const mountain = {
        height: 8849,
        width: 5000,
      };
      
      const description = generateMountainDescription(mountain);
      expect(description).toBe('Height: 8849m, Width: 5000m');
    });

    it('should include country when provided', () => {
      const mountain = {
        height: 8849,
        width: 5000,
        country: 'Nepal/China',
      };
      
      const description = generateMountainDescription(mountain);
      expect(description).toBe('Height: 8849m, Width: 5000m, Location: Nepal/China');
    });

    it('should handle missing country gracefully', () => {
      const mountain = {
        height: 8611,
        width: 4200,
      };
      
      const description = generateMountainDescription(mountain);
      expect(description).toBe('Height: 8611m, Width: 4200m');
    });

    it('should handle zero values correctly', () => {
      const mountain = {
        height: 0,
        width: 0,
        country: 'Test Country',
      };
      
      const description = generateMountainDescription(mountain);
      expect(description).toBe('Height: 0m, Width: 0m, Location: Test Country');
    });

    it('should handle large numbers correctly', () => {
      const mountain = {
        height: 999999,
        width: 888888,
      };
      
      const description = generateMountainDescription(mountain);
      expect(description).toBe('Height: 999999m, Width: 888888m');
    });

    it('should handle empty country string', () => {
      const mountain = {
        height: 5000,
        width: 3000,
        country: '',
      };
      
      const description = generateMountainDescription(mountain);
      // Empty string should be treated as falsy and not included
      expect(description).toBe('Height: 5000m, Width: 3000m');
    });
  });

  describe('buildMountainAriaLabel', () => {
    it('should build aria-label for unselected mountain', () => {
      const options = {
        mountainName: 'Mount Everest',
        height: 8849,
        width: 5000,
        country: 'Nepal/China',
        isSelected: false,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Select Mount Everest for comparison. Height: 8849m, Width: 5000m, Location: Nepal/China'
      );
    });

    it('should build aria-label for selected mountain', () => {
      const options = {
        mountainName: 'K2',
        height: 8611,
        width: 4200,
        country: 'Pakistan/China',
        isSelected: true,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Deselect K2 for comparison. Height: 8611m, Width: 4200m, Location: Pakistan/China'
      );
    });

    it('should handle mountain without country', () => {
      const options = {
        mountainName: 'Test Mountain',
        height: 7000,
        width: 3000,
        isSelected: false,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Select Test Mountain for comparison. Height: 7000m, Width: 3000m'
      );
    });

    it('should handle mountain with special characters in name', () => {
      const options = {
        mountainName: 'Cho Oyu (8,188m)',
        height: 8188,
        width: 4500,
        country: 'Nepal/China',
        isSelected: true,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Deselect Cho Oyu (8,188m) for comparison. Height: 8188m, Width: 4500m, Location: Nepal/China'
      );
    });

    it('should handle empty mountain name', () => {
      const options = {
        mountainName: '',
        height: 5000,
        width: 2000,
        isSelected: false,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Select  for comparison. Height: 5000m, Width: 2000m'
      );
    });

    it('should handle zero height and width values', () => {
      const options = {
        mountainName: 'Flat Mountain',
        height: 0,
        width: 0,
        country: 'Test Land',
        isSelected: false,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Select Flat Mountain for comparison. Height: 0m, Width: 0m, Location: Test Land'
      );
    });
  });
});