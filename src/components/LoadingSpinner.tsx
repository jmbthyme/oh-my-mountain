import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

/**
 * Reusable loading spinner component
 * Requirements: 5.1, 5.4
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className = '',
}) => {
  return (
    <div className={`loading-spinner loading-spinner--${size} ${className}`}>
      <div 
        className="loading-spinner__spinner"
        role="status"
        aria-label={message || 'Loading'}
      >
        <div className="loading-spinner__circle"></div>
      </div>
      {message && (
        <div className="loading-spinner__message" aria-live="polite">
          {message}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;