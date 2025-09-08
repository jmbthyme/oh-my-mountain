/**
 * Shape Calculator Module
 * Calculates mountain widths based on geological shape characteristics
 * Requirements: 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4
 */

/**
 * Enum representing different mountain shape types based on geological characteristics
 * Requirements: 1.2, 1.3, 1.4, 1.5
 */
export enum MountainShape {
  DOME_SHAPED = 'dome-shaped',
  CONICAL = 'conical',
  RIDGE = 'ridge',
  PLATEAU = 'plateau'
}

/**
 * Parameters for shape calculation
 * Requirements: 4.2
 */
export interface ShapeCalculationParams {
  height: number;
  shape: MountainShape;
}

/**
 * Validates input parameters for shape calculation
 * Requirements: 4.3, 4.4
 */
function validateCalculationParams(params: ShapeCalculationParams): void {
  if (typeof params.height !== 'number' || params.height <= 0) {
    throw new Error(`Invalid height value: ${params.height}. Height must be a positive number.`);
  }
  
  if (!Object.values(MountainShape).includes(params.shape)) {
    throw new Error(`Invalid shape value: ${params.shape}. Must be one of: ${Object.values(MountainShape).join(', ')}`);
  }
}

/**
 * Calculates width for dome-shaped mountains
 * Formula: w = 2 × √(h² + r²) where r = h × 0.6
 * Requirements: 1.3, 3.1
 */
function calculateDomeShapedWidth(height: number): number {
  const baseRadius = height * 0.6;
  return 2 * Math.sqrt(height * height + baseRadius * baseRadius);
}

/**
 * Calculates width for conical mountains
 * Formula: w = 2 × h × tan(θ) where θ = 30° (0.577 radians)
 * Requirements: 1.4, 3.2
 */
function calculateConicalWidth(height: number): number {
  const slopeAngleRadians = 30 * (Math.PI / 180); // 30 degrees in radians
  return 2 * height * Math.tan(slopeAngleRadians);
}

/**
 * Calculates width for ridge mountains
 * Formula: w = h × 0.8
 * Requirements: 1.5, 3.3
 */
function calculateRidgeWidth(height: number): number {
  return height * 0.8;
}

/**
 * Calculates width for plateau mountains
 * Formula: w = h × 1.2
 * Requirements: 1.5, 3.4
 */
function calculatePlateauWidth(height: number): number {
  return height * 1.2;
}

/**
 * Applies minimum width constraint
 * Minimum width = h × 0.3
 * Requirements: 3.5
 */
function applyMinimumWidthConstraint(width: number, height: number): number {
  const minimumWidth = height * 0.3;
  return Math.max(width, minimumWidth);
}

/**
 * Main function to calculate mountain width based on shape and height
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export function calculateWidth(params: ShapeCalculationParams): number {
  // Validate input parameters
  validateCalculationParams(params);
  
  const { height, shape } = params;
  let calculatedWidth: number;
  
  // Calculate width based on shape type
  switch (shape) {
    case MountainShape.DOME_SHAPED:
      calculatedWidth = calculateDomeShapedWidth(height);
      break;
    case MountainShape.CONICAL:
      calculatedWidth = calculateConicalWidth(height);
      break;
    case MountainShape.RIDGE:
      calculatedWidth = calculateRidgeWidth(height);
      break;
    case MountainShape.PLATEAU:
      calculatedWidth = calculatePlateauWidth(height);
      break;
    default:
      throw new Error(`Unsupported mountain shape: ${shape}`);
  }
  
  // Apply minimum width constraint
  return applyMinimumWidthConstraint(calculatedWidth, height);
}

/**
 * Convenience function to calculate width with just height and shape string
 * Handles invalid shape values by defaulting to conical
 * Requirements: 2.3, 2.4
 */
export function calculateWidthSafe(height: number, shape: string): number {
  try {
    // Validate and convert shape string to enum
    const mountainShape = Object.values(MountainShape).includes(shape as MountainShape) 
      ? shape as MountainShape 
      : MountainShape.CONICAL;
    
    if (shape !== mountainShape) {
      console.warn(`Invalid shape "${shape}" defaulted to "conical"`);
    }
    
    return calculateWidth({ height, shape: mountainShape });
  } catch (error) {
    console.error(`Error calculating width for height ${height} and shape ${shape}:`, error);
    // Fallback to conical calculation with safe height (use absolute value and minimum 1)
    const safeHeight = Math.max(Math.abs(height), 1);
    return calculateWidth({ height: safeHeight, shape: MountainShape.CONICAL });
  }
}