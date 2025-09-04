/**
 * Configuration interface for triangle scaling calculations
 * Requirements: 3.2
 */
export interface ScaleConfig {
  /** Maximum height among all selected mountains */
  maxHeight: number;
  
  /** Maximum width among all selected mountains */
  maxWidth: number;
  
  /** Available container height for rendering */
  containerHeight: number;
  
  /** Available container width for rendering */
  containerWidth: number;
}