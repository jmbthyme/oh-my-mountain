/**
 * Accessibility utility functions for consistent ARIA implementation
 * Requirements: 2.1, 2.2
 */

/**
 * Generates consistent accessibility IDs for mountain list items
 * @param mountainId - The unique ID of the mountain
 * @returns Object containing all accessibility-related IDs for the mountain
 */
export const generateAccessibilityIds = (mountainId: string) => ({
  nameId: `mountain-name-${mountainId}`,
  detailsId: `mountain-details-${mountainId}`,
  checkboxId: `mountain-checkbox-${mountainId}`,
});

/**
 * Builds ARIA attributes for mountain list items with checkbox semantics
 * @param options - Configuration options for ARIA attributes
 * @returns Object containing ARIA attributes for the mountain list item
 */
export const buildMountainAriaAttributes = (options: {
  mountainId: string;
  isSelected: boolean;
  isDisabled: boolean;
  useCheckboxRole?: boolean;
}) => {
  const { mountainId, isSelected, isDisabled, useCheckboxRole = true } = options;
  const ids = generateAccessibilityIds(mountainId);

  if (useCheckboxRole) {
    return {
      role: 'checkbox' as const,
      'aria-checked': isSelected,
      'aria-labelledby': ids.nameId,
      'aria-describedby': ids.detailsId,
      'aria-disabled': isDisabled,
      tabIndex: isDisabled ? -1 : 0,
    };
  }

  // Fallback to button role with aria-pressed (current implementation)
  return {
    role: 'button' as const,
    'aria-pressed': isSelected,
    'aria-disabled': isDisabled,
    tabIndex: isDisabled ? -1 : 0,
  };
};

/**
 * Generates descriptive text for mountain details with calculated width information
 * @param mountain - Mountain object with height, calculated width, shape, and optional country
 * @returns Formatted string describing the mountain's details including calculated width
 */
export const generateMountainDescription = (mountain: {
  height: number;
  width: number;
  shape: string;
  country?: string;
}) => {
  const parts = [
    `Height: ${mountain.height}m`,
    `Calculated width: ${Math.round(mountain.width)}m`,
    `Shape: ${mountain.shape.replace('-', ' ')}`,
  ];
  
  if (mountain.country) {
    parts.push(`Location: ${mountain.country}`);
  }
  
  return parts.join(', ');
};

/**
 * Generates enhanced mountain description specifically for assistive technology
 * Emphasizes that width is calculated based on shape and provides clear context
 * @param mountain - Mountain object with calculated width and shape information
 * @returns Detailed description optimized for screen readers
 */
export const generateMountainDescriptionForScreenReader = (mountain: {
  height: number;
  width: number;
  shape: string;
  country?: string;
}) => {
  const shapeName = mountain.shape.replace('-', ' ');
  const roundedWidth = Math.round(mountain.width);
  
  const parts = [
    `Height: ${mountain.height.toLocaleString()} meters`,
    `Width: ${roundedWidth.toLocaleString()} meters, calculated based on ${shapeName} shape`,
  ];
  
  if (mountain.country) {
    parts.push(`Located in ${mountain.country}`);
  }
  
  return parts.join('. ') + '.';
};

/**
 * Generates accessible description for mountain triangle visualizations
 * Provides detailed information about the visual representation for screen readers
 * @param mountain - Mountain object with calculated dimensions and shape
 * @returns Comprehensive description of the mountain triangle visualization
 */
export const generateMountainTriangleDescription = (mountain: {
  name: string;
  height: number;
  width: number;
  shape: string;
  country?: string;
}) => {
  const shapeName = mountain.shape.replace('-', ' ');
  const roundedWidth = Math.round(mountain.width);
  
  let description = `${mountain.name} mountain triangle visualization. `;
  description += `Height: ${mountain.height.toLocaleString()} meters. `;
  description += `Base width: ${roundedWidth.toLocaleString()} meters, calculated from ${shapeName} geological shape. `;
  
  if (mountain.country) {
    description += `Located in ${mountain.country}. `;
  }
  
  description += `Triangle represents proportional mountain dimensions for comparison.`;
  
  return description;
};

/**
 * Builds comprehensive aria-label for mountain list items with calculated width information
 * @param options - Configuration options for aria-label generation
 * @returns Complete aria-label string for the mountain item including calculated width
 */
export const buildMountainAriaLabel = (options: {
  mountainName: string;
  height: number;
  width: number;
  shape: string;
  country?: string;
  isSelected: boolean;
}) => {
  const { mountainName, height, width, shape, country, isSelected } = options;
  const action = isSelected ? 'Deselect' : 'Select';
  const description = generateMountainDescription({ height, width, shape, country });
  
  return `${action} ${mountainName} for comparison. ${description}`;
};