import type { Mountain, MountainWithCalculatedWidth } from './Mountain';

/**
 * Component prop interfaces for type safety
 * Requirements: 6.1
 */

/** Props for the MountainList component */
export interface MountainListProps {
  /** Array of all available mountains with calculated widths */
  mountains: MountainWithCalculatedWidth[];
  
  /** Array of currently selected mountains with calculated widths */
  selectedMountains: MountainWithCalculatedWidth[];
  
  /** Callback function when a mountain is toggled (selected/deselected) */
  onMountainToggle: (mountain: MountainWithCalculatedWidth) => void;
}

/** Props for the ComparisonView component */
export interface ComparisonViewProps {
  /** Array of selected mountains to display as triangles with calculated widths */
  selectedMountains: MountainWithCalculatedWidth[];
}

/** Props for the MountainTriangle component */
export interface MountainTriangleProps {
  /** Mountain data to render as triangle (with calculated width) */
  mountain: MountainWithCalculatedWidth;
  
  /** Scale factor for proportional sizing */
  scale: number;
  
  /** Maximum dimensions for scaling calculations */
  maxDimensions: {
    maxHeight: number;
    maxWidth: number;
  };
}

/** Props for the Header component */
export interface HeaderProps {
  /** Number of currently selected mountains */
  selectedCount: number;
  
  /** Callback function to clear all selections */
  onClearSelections?: () => void;
}