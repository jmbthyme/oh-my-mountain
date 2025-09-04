/**
 * Core Mountain interface representing a mountain with its dimensions and metadata
 * Requirements: 6.1, 1.2, 3.2
 */
export interface Mountain {
  /** Unique identifier for the mountain */
  id: string;
  
  /** Display name of the mountain */
  name: string;
  
  /** Height of the mountain in meters */
  height: number;
  
  /** Base width of the mountain in meters */
  width: number;
  
  /** Optional country where the mountain is located */
  country?: string;
  
  /** Optional region or mountain range */
  region?: string;
}