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

// Accessibility utilities
export {
  generateAccessibilityIds,
  buildMountainAriaAttributes,
  generateMountainDescription,
  generateMountainDescriptionForScreenReader,
  generateMountainTriangleDescription,
  buildMountainAriaLabel,
} from './accessibility';

// Shape calculation utilities
export {
  MountainShape,
  calculateWidth,
  calculateWidthSafe,
  type ShapeCalculationParams,
} from './shapeCalculator';

// Mountain data transformation utilities
export {
  transformMountainData,
  transformMountainDataArray,
  processRawMountainData,
  loadAndTransformMountainData,
  DataTransformationError,
  type RawMountainData,
} from './mountainDataTransformer';