import { describe, it, expect } from 'vitest';
import { 
  generateAccessibilityIds, 
  buildMountainAriaAttributes, 
  generateMountainDescription,
  generateMountainDescriptionForScreenReader,
  generateMountainTriangleDescription,
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
    it('should generate description with height, calculated width, and shape', () => {
      const mountain = {
        height: 8849,
        width: 5000,
        shape: 'conical',
      };
      
      const description = generateMountainDescription(mountain);
      expect(description).toBe('Height: 8849m, Calculated width: 5000m, Shape: conical');
    });

    it('should include country when provided', () => {
      const mountain = {
        height: 8849,
        width: 5000,
        shape: 'conical',
        country: 'Nepal/China',
      };
      
      const description = generateMountainDescription(mountain);
      expect(description).toBe('Height: 8849m, Calculated width: 5000m, Shape: conical, Location: Nepal/China');
    });

    it('should handle dome-shaped mountains', () => {
      const mountain = {
        height: 8611,
        width: 4200,
        shape: 'dome-shaped',
      };
      
      const description = generateMountainDescription(mountain);
      expect(description).toBe('Height: 8611m, Calculated width: 4200m, Shape: dome shaped');
    });

    it('should round calculated width values', () => {
      const mountain = {
        height: 8000,
        width: 4567.89,
        shape: 'ridge',
        country: 'Test Country',
      };
      
      const description = generateMountainDescription(mountain);
      expect(description).toBe('Height: 8000m, Calculated width: 4568m, Shape: ridge, Location: Test Country');
    });

    it('should handle zero values correctly', () => {
      const mountain = {
        height: 0,
        width: 0,
        shape: 'plateau',
        country: 'Test Country',
      };
      
      const description = generateMountainDescription(mountain);
      expect(description).toBe('Height: 0m, Calculated width: 0m, Shape: plateau, Location: Test Country');
    });

    it('should handle empty country string', () => {
      const mountain = {
        height: 5000,
        width: 3000,
        shape: 'conical',
        country: '',
      };
      
      const description = generateMountainDescription(mountain);
      // Empty string should be treated as falsy and not included
      expect(description).toBe('Height: 5000m, Calculated width: 3000m, Shape: conical');
    });
  });

  describe('generateMountainDescriptionForScreenReader', () => {
    it('should generate detailed description for screen readers', () => {
      const mountain = {
        height: 8849,
        width: 5000,
        shape: 'conical',
        country: 'Nepal/China',
      };
      
      const description = generateMountainDescriptionForScreenReader(mountain);
      expect(description).toBe('Height: 8849 meters. Width: 5000 meters, calculated based on conical shape. Located in Nepal/China.');
    });

    it('should handle dome-shaped mountains with proper formatting', () => {
      const mountain = {
        height: 4807,
        width: 3200.67,
        shape: 'dome-shaped',
      };
      
      const description = generateMountainDescriptionForScreenReader(mountain);
      expect(description).toBe('Height: 4807 meters. Width: 3201 meters, calculated based on dome shaped shape.');
    });

    it('should handle mountains without country information', () => {
      const mountain = {
        height: 7000,
        width: 4500,
        shape: 'ridge',
      };
      
      const description = generateMountainDescriptionForScreenReader(mountain);
      expect(description).toBe('Height: 7000 meters. Width: 4500 meters, calculated based on ridge shape.');
    });

    it('should format large numbers with locale-specific separators', () => {
      const mountain = {
        height: 12345,
        width: 98765,
        shape: 'plateau',
        country: 'Test Country',
      };
      
      const description = generateMountainDescriptionForScreenReader(mountain);
      expect(description).toBe('Height: 12.345 meters. Width: 98.765 meters, calculated based on plateau shape. Located in Test Country.');
    });
  });

  describe('generateMountainTriangleDescription', () => {
    it('should generate comprehensive triangle visualization description', () => {
      const mountain = {
        name: 'Mount Everest',
        height: 8849,
        width: 5000,
        shape: 'conical',
        country: 'Nepal/China',
      };
      
      const description = generateMountainTriangleDescription(mountain);
      expect(description).toBe('Mount Everest mountain triangle visualization. Height: 8849 meters. Base width: 5000 meters, calculated from conical geological shape. Located in Nepal/China. Triangle represents proportional mountain dimensions for comparison.');
    });

    it('should handle dome-shaped mountains', () => {
      const mountain = {
        name: 'Mont Blanc',
        height: 4807,
        width: 3200.89,
        shape: 'dome-shaped',
      };
      
      const description = generateMountainTriangleDescription(mountain);
      expect(description).toBe('Mont Blanc mountain triangle visualization. Height: 4807 meters. Base width: 3201 meters, calculated from dome shaped geological shape. Triangle represents proportional mountain dimensions for comparison.');
    });

    it('should handle mountains without country information', () => {
      const mountain = {
        name: 'Test Peak',
        height: 6000,
        width: 4000,
        shape: 'ridge',
      };
      
      const description = generateMountainTriangleDescription(mountain);
      expect(description).toBe('Test Peak mountain triangle visualization. Height: 6000 meters. Base width: 4000 meters, calculated from ridge geological shape. Triangle represents proportional mountain dimensions for comparison.');
    });

    it('should round width values appropriately', () => {
      const mountain = {
        name: 'Plateau Mountain',
        height: 5500,
        width: 7234.567,
        shape: 'plateau',
        country: 'Test Land',
      };
      
      const description = generateMountainTriangleDescription(mountain);
      expect(description).toBe('Plateau Mountain mountain triangle visualization. Height: 5500 meters. Base width: 7235 meters, calculated from plateau geological shape. Located in Test Land. Triangle represents proportional mountain dimensions for comparison.');
    });
  });

  describe('buildMountainAriaLabel', () => {
    it('should build aria-label for unselected mountain with calculated width', () => {
      const options = {
        mountainName: 'Mount Everest',
        height: 8849,
        width: 5000,
        shape: 'conical',
        country: 'Nepal/China',
        isSelected: false,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Select Mount Everest for comparison. Height: 8849m, Calculated width: 5000m, Shape: conical, Location: Nepal/China'
      );
    });

    it('should build aria-label for selected mountain with calculated width', () => {
      const options = {
        mountainName: 'K2',
        height: 8611,
        width: 4200,
        shape: 'conical',
        country: 'Pakistan/China',
        isSelected: true,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Deselect K2 for comparison. Height: 8611m, Calculated width: 4200m, Shape: conical, Location: Pakistan/China'
      );
    });

    it('should handle dome-shaped mountain without country', () => {
      const options = {
        mountainName: 'Test Mountain',
        height: 7000,
        width: 3000,
        shape: 'dome-shaped',
        isSelected: false,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Select Test Mountain for comparison. Height: 7000m, Calculated width: 3000m, Shape: dome shaped'
      );
    });

    it('should handle ridge mountain with special characters in name', () => {
      const options = {
        mountainName: 'Cho Oyu (8,188m)',
        height: 8188,
        width: 4500,
        shape: 'ridge',
        country: 'Nepal/China',
        isSelected: true,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Deselect Cho Oyu (8,188m) for comparison. Height: 8188m, Calculated width: 4500m, Shape: ridge, Location: Nepal/China'
      );
    });

    it('should handle plateau mountain with empty name', () => {
      const options = {
        mountainName: '',
        height: 5000,
        width: 2000,
        shape: 'plateau',
        isSelected: false,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Select  for comparison. Height: 5000m, Calculated width: 2000m, Shape: plateau'
      );
    });

    it('should handle zero height and width values with shape', () => {
      const options = {
        mountainName: 'Flat Mountain',
        height: 0,
        width: 0,
        shape: 'plateau',
        country: 'Test Land',
        isSelected: false,
      };
      
      const ariaLabel = buildMountainAriaLabel(options);
      expect(ariaLabel).toBe(
        'Select Flat Mountain for comparison. Height: 0m, Calculated width: 0m, Shape: plateau, Location: Test Land'
      );
    });
  });
});