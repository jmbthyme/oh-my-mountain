import React, { useState, useEffect, useCallback } from 'react';
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
 */
const ComparisonView: React.FC<ComparisonViewProps> = ({ selectedMountains }) => {
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

  // Calculate scaling for all mountains
  const maxDimensions = calculateMaxDimensions(selectedMountains);
  const scaleFactor = calculateScaleFactor(maxDimensions, containerDimensions);

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

  // Determine grid layout based on number of mountains and screen size
  const getGridColumns = (count: number, containerWidth: number): number => {
    if (containerWidth < 480) {
      // Mobile: 1-2 columns max
      return Math.min(2, count);
    } else if (containerWidth < 768) {
      // Tablet: 2-3 columns max
      return Math.min(3, count);
    } else if (containerWidth < 1200) {
      // Desktop small: 3-4 columns max
      return Math.min(4, count);
    } else {
      // Desktop large: up to 5 columns
      return Math.min(5, count);
    }
  };

  const gridColumns = getGridColumns(selectedMountains.length, containerDimensions.containerWidth);

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
            {Math.max(...selectedMountains.map(m => m.height)).toLocaleString()}m
          </span>
        </div>
        <div className="scale-info__item">
          <span className="scale-info__label">Widest:</span>
          <span className="scale-info__value">
            {Math.max(...selectedMountains.map(m => m.width)).toLocaleString()}m
          </span>
        </div>
        <div className="scale-info__item">
          <span className="scale-info__label">Scale:</span>
          <span className="scale-info__value">
            1:{Math.round(1 / scaleFactor).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;