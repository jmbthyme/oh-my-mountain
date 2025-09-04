import type { Mountain } from './Mountain';

/**
 * Component prop interfaces for type safety
 * Requirements: 6.1
 */

/** Props for the MountainList component */
export interface MountainListProps {
  /** Array of all available mountains */
  mountains: Mountain[];
  
  /** Array of currently selected mountains */
  selectedMountains: Mountain[];
  
  /** Callback function when a mountain is toggled (selected/deselected) */
  onMountainToggle: (mountain: Mountain) => void;
}

/** Props for the ComparisonView component */
export interface ComparisonViewProps {
  /** Array of selected mountains to display as triangles */
  selectedMountains: Mountain[];
}

/** Props for the MountainTriangle component */
export interface MountainTriangleProps {
  /** Mountain data to render as triangle */
  mountain: Mountain;
  
  /** Scale factor for proportional sizing */
  scale: number;
  
  /** Maximum dimensions for scaling calculations */
  maxDimensions: {
    height: number;
    width: number;
  };
}

/** Props for the Header component */
export interface HeaderProps {
  /** Number of currently selected mountains */
  selectedCount: number;
  
  /** Callback function to clear all selections */
  onClearSelections?: () => void;
}