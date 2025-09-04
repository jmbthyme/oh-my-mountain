import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
}

/**
 * Skeleton loader component for better loading UX
 * Requirements: 5.1, 5.4
 * Performance: Memoized to prevent unnecessary re-renders
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = React.memo(({
  variant = 'text',
  width,
  height,
  className = '',
  animate = true,
}) => {
  const style: React.CSSProperties = {};
  
  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  
  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <div
      className={`skeleton skeleton--${variant} ${animate ? 'skeleton--animate' : ''} ${className}`}
      style={style}
      role="status"
      aria-label="Loading content"
    />
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

/**
 * Skeleton component for mountain list items
 * Performance: Memoized since props don't change
 */
export const MountainListSkeleton: React.FC = React.memo(() => {
  return (
    <div className="mountain-list-skeleton">
      <div className="mountain-list-skeleton__header">
        <SkeletonLoader variant="text" width="60%" height="24px" />
        <SkeletonLoader variant="text" width="40%" height="16px" />
      </div>
      
      <div className="mountain-list-skeleton__items">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="mountain-list-skeleton__item">
            <SkeletonLoader variant="rectangular" width="20px" height="20px" />
            <div className="mountain-list-skeleton__content">
              <SkeletonLoader variant="text" width="70%" height="18px" />
              <SkeletonLoader variant="text" width="50%" height="14px" />
              <SkeletonLoader variant="text" width="60%" height="14px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

MountainListSkeleton.displayName = 'MountainListSkeleton';

/**
 * Skeleton component for comparison view
 * Performance: Memoized since props don't change
 */
export const ComparisonViewSkeleton: React.FC = React.memo(() => {
  return (
    <div className="comparison-view-skeleton">
      <div className="comparison-view-skeleton__header">
        <SkeletonLoader variant="text" width="60%" height="24px" />
        <SkeletonLoader variant="text" width="80%" height="16px" />
      </div>
      
      <div className="comparison-view-skeleton__grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="comparison-view-skeleton__item">
            <SkeletonLoader variant="rectangular" width="120px" height="100px" />
            <SkeletonLoader variant="text" width="80%" height="16px" />
            <SkeletonLoader variant="text" width="60%" height="14px" />
          </div>
        ))}
      </div>
    </div>
  );
});

ComparisonViewSkeleton.displayName = 'ComparisonViewSkeleton';

export default SkeletonLoader;