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
 * Generates descriptive text for mountain details
 * @param mountain - Mountain object with height, width, and optional country
 * @returns Formatted string describing the mountain's details
 */
export const generateMountainDescription = (mountain: {
  height: number;
  width: number;
  country?: string;
}) => {
  const parts = [
    `Height: ${mountain.height}m`,
    `Width: ${mountain.width}m`,
  ];
  
  if (mountain.country) {
    parts.push(`Location: ${mountain.country}`);
  }
  
  return parts.join(', ');
};

/**
 * Builds comprehensive aria-label for mountain list items (fallback approach)
 * @param options - Configuration options for aria-label generation
 * @returns Complete aria-label string for the mountain item
 */
export const buildMountainAriaLabel = (options: {
  mountainName: string;
  height: number;
  width: number;
  country?: string;
  isSelected: boolean;
}) => {
  const { mountainName, height, width, country, isSelected } = options;
  const action = isSelected ? 'Deselect' : 'Select';
  const description = generateMountainDescription({ height, width, country });
  
  return `${action} ${mountainName} for comparison. ${description}`;
};