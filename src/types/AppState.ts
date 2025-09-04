import type { Mountain } from './Mountain';

/**
 * Global application state interface for state management
 * Requirements: 6.1, 1.2
 */
export interface AppState {
  /** Array of all available mountains loaded from data */
  mountains: Mountain[];
  
  /** Array of currently selected mountains for comparison */
  selectedMountains: Mountain[];
  
  /** Loading state indicator for data fetching */
  loading: boolean;
  
  /** Error message if any operation fails, null if no error */
  error: string | null;
}