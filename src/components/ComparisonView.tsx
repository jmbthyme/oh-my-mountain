import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ComparisonViewProps } from '../types';
import MountainTriangle from './MountainTriangle';
import { 
  calculateMaxDimensions, 
  calculateContainerDimensions, 
  calculateScaleFactor 
} from '../utils';
import './ComparisonView.css';

/**
 * ComparisonView component for mountain visualization layout
 * Arranges multiple MountainTriangle components in a responsive grid
 * Requirements: 2.4, 3.3, 3.4, 5.3
 * Performance: Optimized with memoization and efficient rendering
 */
const ComparisonView: React.FC<ComparisonViewProps> = React.memo(({ selectedMountains }) => {
  const [containerDimensions, setContainerDimensions] = useState({
    containerWidth: 800,
    containerHeight: 600,
  });

  // Update container dimensions on window resize
  const updateDimensions = useCallback(() => {
    const { containerWidth, containerHeight } = calculateContainerDimensions(
      window.innerWidth,
      window.innerHeight
    );
    setContainerDimensions({ containerWidth, containerHeight });
  }, []);

  useEffect(() => {
    // Set initial dimensions
    updateDimensions();

    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Memoize expensive calculations to prevent unnecessary recalculations
  // These hooks must be called before any conditional returns to follow Rules of Hooks
  const maxDimensions = useMemo(() => 
    selectedMountains.length > 0 ? calculateMaxDimensions(selectedMountains) : { maxHeight: 0, maxWidth: 0 }, 
    [selectedMountains]
  );
  
  const scaleFactor = useMemo(() => 
    selectedMountains.length > 0 ? calculateScaleFactor(maxDimensions, containerDimensions) : 1,
    [maxDimensions, containerDimensions, selectedMountains.length]
  );

  // Memoize grid columns calculation
  const gridColumns = useMemo(() => {
    const getGridColumns = (count: number, containerWidth: number): number => {
      if (containerWidth < 360) {
        return 1;
      } else if (containerWidth < 480) {
        return Math.min(2, count);
      } else if (containerWidth < 640) {
        return Math.min(3, count);
      } else if (containerWidth < 768) {
        return Math.min(3, count);
      } else if (containerWidth < 1024) {
        return Math.min(4, count);
      } else if (containerWidth < 1200) {
        return Math.min(5, count);
      } else {
        return Math.min(6, count);
      }
    };
    return getGridColumns(selectedMountains.length, containerDimensions.containerWidth);
  }, [selectedMountains.length, containerDimensions.containerWidth]);

  // Memoize scale info calculations
  const scaleInfo = useMemo(() => {
    if (selectedMountains.length === 0) {
      return { tallest: 0, widest: 0, scale: 1 };
    }
    return {
      tallest: Math.max(...selectedMountains.map(m => m.height)),
      widest: Math.max(...selectedMountains.map(m => m.width)),
      scale: Math.round(1 / scaleFactor)
    };
  }, [selectedMountains, scaleFactor]);

  // Handle empty state
  if (selectedMountains.length === 0) {
    return (
      <div className="comparison-view comparison-view--empty">
        <div className="empty-state">
          <div className="empty-state__icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="Mountain icon"
            >
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </div>
          <h3 className="empty-state__title">No Mountains Selected</h3>
          <p className="empty-state__description">
            Select mountains from the list to see their size comparison visualization.
            You can select up to 10 mountains at once.
          </p>
        </div>
      </div>
    );
  }

  // Handle single mountain selection with centered layout
  if (selectedMountains.length === 1) {
    return (
      <div className="comparison-view comparison-view--single">
        <div className="single-mountain-container">
          <MountainTriangle
            mountain={selectedMountains[0]}
            scale={scaleFactor}
            maxDimensions={maxDimensions}
          />
          <div className="single-mountain-info">
            <p className="single-mountain-note">
              Select more mountains to compare their relative sizes
            </p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <h2 className="comparison-title">
          Mountain Size Comparison ({selectedMountains.length} mountain{selectedMountains.length !== 1 ? 's' : ''})
        </h2>
        <p className="comparison-subtitle">
          All mountains are shown to the same scale for accurate size comparison
        </p>
      </div>

      <div 
        className="mountains-grid"
        style={{
          '--grid-columns': gridColumns,
          '--container-width': `${containerDimensions.containerWidth}px`,
          '--container-height': `${containerDimensions.containerHeight}px`,
        } as React.CSSProperties}
      >
        {selectedMountains.map((mountain) => (
          <div key={mountain.id} className="mountain-grid-item">
            <MountainTriangle
              mountain={mountain}
              scale={scaleFactor}
              maxDimensions={maxDimensions}
            />
          </div>
        ))}
      </div>

      {/* Scale reference information */}
      <div className="scale-info">
        <div className="scale-info__item">
          <span className="scale-info__label">Tallest:</span>
          <span className="scale-info__value">
            {scaleInfo.tallest.toLocaleString()}m
          </span>
        </div>
        <div className="scale-info__item">
          <span className="scale-info__label">Widest:</span>
          <span className="scale-info__value">
            {scaleInfo.widest.toLocaleString()}m
          </span>
        </div>
        <div className="scale-info__item">
          <span className="scale-info__label">Scale:</span>
          <span className="scale-info__value">
            1:{scaleInfo.scale.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for React.memo
  // Only re-render if selectedMountains array changes
  if (prevProps.selectedMountains.length !== nextProps.selectedMountains.length) {
    return false;
  }
  
  return prevProps.selectedMountains.every((mountain, index) => 
    mountain.id === nextProps.selectedMountains[index]?.id
  );
});

ComparisonView.displayName = 'ComparisonView';

export default ComparisonView;