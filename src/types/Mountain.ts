import { MountainShape } from '../utils/shapeCalculator';

/**
 * Core Mountain interface representing a mountain with its geological characteristics and metadata
 * Requirements: 2.1, 2.2
 */
export interface Mountain {
  /** Unique identifier for the mountain */
  id: string;
  
  /** Display name of the mountain */
  name: string;
  
  /** Height of the mountain in meters */
  height: number;
  
  /** Geological shape classification of the mountain */
  shape: MountainShape;
  
  /** Optional country where the mountain is located */
  country?: string;
  
  /** Optional region or mountain range */
  region?: string;
}

/**
 * Extended Mountain interface with calculated width for rendering purposes
 * This interface includes the dynamically calculated width based on shape and height
 * Requirements: 2.1, 2.2
 */
export interface MountainWithCalculatedWidth extends Mountain {
  /** Calculated base width of the mountain in meters based on shape and height */
  width: number;
}