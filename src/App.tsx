import { useState, useCallback } from 'react';
import { useMountainData } from './hooks';
import { Header, MountainList, ComparisonView } from './components';
import type { Mountain } from './types';
import './App.css';

/**
 * Main App component with global state management
 * Requirements: 5.1, 5.2, 5.4
 */
function App() {
  // Load mountain data using custom hook
  const { mountains, loading, error, retry } = useMountainData();
  
  // Global state for selected mountains
  const [selectedMountains, setSelectedMountains] = useState<Mountain[]>([]);

  // Handle mountain selection toggle
  const handleMountainToggle = useCallback((mountain: Mountain) => {
    setSelectedMountains(prev => {
      const isSelected = prev.some(m => m.id === mountain.id);
      
      if (isSelected) {
        // Remove mountain from selection
        return prev.filter(m => m.id !== mountain.id);
      } else {
        // Add mountain to selection (max 10 mountains)
        if (prev.length >= 10) {
          return prev; // Don't add if at maximum
        }
        return [...prev, mountain];
      }
    });
  }, []);

  // Handle clearing all selections
  const handleClearSelections = useCallback(() => {
    setSelectedMountains([]);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <div className="app__loading">
          <div className="loading-spinner" role="status" aria-label="Loading mountain data">
            <div className="spinner"></div>
          </div>
          <h2>Loading Mountain Data...</h2>
          <p>Please wait while we fetch the mountain information.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app">
        <div className="app__error">
          <div className="error-icon" role="img" aria-label="Error">⚠️</div>
          <h2>Failed to Load Mountain Data</h2>
          <p className="error-message">{error}</p>
          <button 
            className="retry-button" 
            onClick={retry}
            type="button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        selectedCount={selectedMountains.length}
        onClearSelections={handleClearSelections}
      />
      
      <main className="app__main">
        <div className="app__container">
          <div className="app__sidebar">
            <MountainList
              mountains={mountains}
              selectedMountains={selectedMountains}
              onMountainToggle={handleMountainToggle}
            />
          </div>
          
          <div className="app__content">
            <ComparisonView selectedMountains={selectedMountains} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
