/**
 * TypeScript interfaces for accessibility props and configurations
 * Requirements: 2.1, 2.2
 */

/**
 * Base accessibility props that can be applied to interactive elements
 */
export interface AccessibilityProps {
  /** ARIA role for the element */
  role: 'checkbox' | 'button';
  
  /** Indicates if a checkbox is checked (for checkbox role) */
  'aria-checked'?: boolean;
  
  /** Indicates if a button is pressed (for button role) */
  'aria-pressed'?: boolean;
  
  /** References to elements that label this element */
  'aria-labelledby'?: string;
  
  /** References to elements that describe this element */
  'aria-describedby'?: string;
  
  /** Indicates if the element is disabled */
  'aria-disabled'?: boolean;
  
  /** Direct accessible label for the element */
  'aria-label'?: string;
  
  /** Tab index for keyboard navigation */
  tabIndex?: number;
}

/**
 * Configuration options for generating accessibility IDs
 */
export interface AccessibilityIdConfig {
  /** Unique identifier for the mountain */
  mountainId: string;
}

/**
 * Generated accessibility IDs for a mountain list item
 */
export interface AccessibilityIds {
  /** ID for the mountain name element */
  nameId: string;
  
  /** ID for the mountain details element */
  detailsId: string;
  
  /** ID for the checkbox input element */
  checkboxId: string;
}

/**
 * Configuration for building ARIA attributes for mountain list items
 */
export interface MountainAriaConfig {
  /** Unique identifier for the mountain */
  mountainId: string;
  
  /** Whether the mountain is currently selected */
  isSelected: boolean;
  
  /** Whether the mountain item is disabled */
  isDisabled: boolean;
  
  /** Whether to use checkbox role (true) or button role (false) */
  useCheckboxRole?: boolean;
}

/**
 * Mountain data required for accessibility descriptions
 */
export interface MountainAccessibilityData {
  /** Mountain name */
  name: string;
  
  /** Mountain height in meters */
  height: number;
  
  /** Mountain width in meters */
  width: number;
  
  /** Optional country location */
  country?: string;
}

/**
 * Configuration for generating aria-label text
 */
export interface AriaLabelConfig extends MountainAccessibilityData {
  /** Whether the mountain is currently selected */
  isSelected: boolean;
}

/**
 * Extended props for mountain list items with accessibility support
 */
export interface AccessibleMountainItemProps extends AccessibilityProps {
  /** Data test ID for testing */
  'data-testid'?: string;
  
  /** CSS class names */
  className?: string;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Keyboard event handler */
  onKeyDown?: (event: React.KeyboardEvent) => void;
}