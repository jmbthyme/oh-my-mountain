import { useState, useCallback } from 'react';
import { useMountainData, useToast } from './hooks';
import { 
  Header, 
  MountainList, 
  ComparisonView, 
  ErrorBoundary, 
  ToastContainer,
  MountainListSkeleton,
  ComparisonViewSkeleton 
} from './components';
import type { Mountain } from './types';
import './App.css';

/**
 * Main App component with global state management
 * Requirements: 5.1, 5.2, 5.4
 */
function App() {
  // Load mountain data using custom hook
  const { mountains, loading, error, retry } = useMountainData();
  
  // Toast notifications
  const { toasts, removeToast, showWarning, showError, showSuccess } = useToast();
  
  // Global state for selected mountains
  const [selectedMountains, setSelectedMountains] = useState<Mountain[]>([]);

  // Handle mountain selection toggle
  const handleMountainToggle = useCallback((mountain: Mountain) => {
    setSelectedMountains(prev => {
      const isSelected = prev.some(m => m.id === mountain.id);
      
      if (isSelected) {
        // Remove mountain from selection
        showSuccess('Mountain removed', `${mountain.name} removed from comparison`);
        return prev.filter(m => m.id !== mountain.id);
      } else {
        // Add mountain to selection (max 10 mountains)
        if (prev.length >= 10) {
          showWarning(
            'Selection limit reached', 
            'You can compare up to 10 mountains at once. Remove some mountains to add new ones.'
          );
          return prev; // Don't add if at maximum
        }
        showSuccess('Mountain added', `${mountain.name} added to comparison`);
        return [...prev, mountain];
      }
    });
  }, [showSuccess, showWarning]);

  // Handle clearing all selections
  const handleClearSelections = useCallback(() => {
    const count = selectedMountains.length;
    setSelectedMountains([]);
    if (count > 0) {
      showSuccess('Selections cleared', `Removed ${count} mountain${count !== 1 ? 's' : ''} from comparison`);
    }
  }, [selectedMountains.length, showSuccess]);

  // Loading state with skeleton screens
  if (loading) {
    return (
      <div className="app">
        <ErrorBoundary>
          <Header selectedCount={0} onClearSelections={() => {}} />
          <main className="app__main">
            <div className="app__container">
              <div className="app__sidebar">
                <MountainListSkeleton />
              </div>
              <div className="app__content">
                <ComparisonViewSkeleton />
              </div>
            </div>
          </main>
        </ErrorBoundary>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    );
  }

  // Error state
  if (error) {
    // Show error toast for better user feedback
    if (toasts.length === 0) {
      showError('Failed to load data', error);
    }
    
    return (
      <div className="app">
        <ErrorBoundary>
          <div className="app__error">
            <div className="error-icon" role="img" aria-label="Error">⚠️</div>
            <h2>Failed to Load Mountain Data</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button 
                className="retry-button" 
                onClick={() => {
                  retry();
                  showSuccess('Retrying...', 'Attempting to reload mountain data');
                }}
                type="button"
              >
                Try Again
              </button>
              <button
                className="reload-button"
                onClick={() => window.location.reload()}
                type="button"
              >
                Reload Page
              </button>
            </div>
          </div>
        </ErrorBoundary>
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="app">
      <ErrorBoundary>
        <Header 
          selectedCount={selectedMountains.length}
          onClearSelections={handleClearSelections}
        />
        
        <main className="app__main">
          <div className="app__container">
            <div className="app__sidebar">
              <ErrorBoundary fallback={
                <div className="error-fallback">
                  <p>Failed to load mountain list</p>
                  <button onClick={() => window.location.reload()}>Reload</button>
                </div>
              }>
                <MountainList
                  mountains={mountains}
                  selectedMountains={selectedMountains}
                  onMountainToggle={handleMountainToggle}
                />
              </ErrorBoundary>
            </div>
            
            <div className="app__content">
              <ErrorBoundary fallback={
                <div className="error-fallback">
                  <p>Failed to load comparison view</p>
                  <button onClick={() => window.location.reload()}>Reload</button>
                </div>
              }>
                <ComparisonView selectedMountains={selectedMountains} />
              </ErrorBoundary>
            </div>
          </div>
        </main>
      </ErrorBoundary>
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default App;
