/**
 * Central export file for all utility functions
 */

// Data loading utilities
export { loadMountainData, DataLoadError } from './dataLoader';

// Data validation utilities
export { 
  validateMountain, 
  validateMountains, 
  validateMountainData, 
  ValidationError 
} from './dataValidator';

// Scaling utilities
export {
  calculateMaxDimensions,
  calculateContainerDimensions,
  calculateScaleFactor,
  createScaleConfig,
  generateTrianglePath,
  calculateScaledDimensions,
  calculateSVGViewBox,
} from './scalingUtils';