import React from 'react';
import type { HeaderProps } from '../types';
import './Header.css';

/**
 * Header component with application title and navigation controls
 * Requirements: 2.3, 5.3
 */
export const Header: React.FC<HeaderProps> = ({
  selectedCount,
  onClearSelections,
}) => {
  const handleClearClick = () => {
    if (selectedCount > 0 && onClearSelections) {
      // Simple confirmation for clearing selections
      const confirmed = window.confirm(
        `Are you sure you want to clear all ${selectedCount} selected mountain${selectedCount !== 1 ? 's' : ''}?`
      );
      
      if (confirmed) {
        onClearSelections();
      }
    }
  };

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__branding">
          <h1 className="header__title">
            <span className="header__icon" role="img" aria-label="Mountain">🏔️</span>
            Mountain Comparison
          </h1>
          <p className="header__subtitle">
            Compare mountain dimensions with interactive visualizations
          </p>
        </div>
        
        <div className="header__controls">
          <div className="header__selection-info">
            <span className="header__count">
              {selectedCount} mountain{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          {selectedCount > 0 && onClearSelections && (
            <button
              className="header__clear-button"
              onClick={handleClearClick}
              type="button"
              aria-label={`Clear all ${selectedCount} selected mountains`}
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;