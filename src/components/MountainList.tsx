import React from 'react';
import type { MountainListProps } from '../types';
import './MountainList.css';

/**
 * MountainList component displays available mountains and handles selection
 * Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4
 */
export const MountainList: React.FC<MountainListProps> = ({
  mountains,
  selectedMountains,
  onMountainToggle,
}) => {
  const selectedIds = new Set(selectedMountains.map(m => m.id));
  const maxSelections = 10;
  const isAtMaxSelections = selectedMountains.length >= maxSelections;

  const handleMountainClick = (mountain: any) => {
    const isSelected = selectedIds.has(mountain.id);
    
    // If not selected and at max limit, don't allow selection
    if (!isSelected && isAtMaxSelections) {
      return;
    }
    
    onMountainToggle(mountain);
  };

  return (
    <div className="mountain-list">
      <div className="mountain-list__header">
        <h2>Available Mountains</h2>
        <div className="mountain-list__selection-info">
          {selectedMountains.length} of {maxSelections} selected
        </div>
      </div>
      
      {isAtMaxSelections && (
        <div className="mountain-list__warning" role="alert">
          Maximum of {maxSelections} mountains can be selected for comparison
        </div>
      )}
      
      <div className="mountain-list__items">
        {mountains.map((mountain) => {
          const isSelected = selectedIds.has(mountain.id);
          const isDisabled = !isSelected && isAtMaxSelections;
          
          return (
            <div
              key={mountain.id}
              className={`mountain-list__item ${
                isSelected ? 'mountain-list__item--selected' : ''
              } ${
                isDisabled ? 'mountain-list__item--disabled' : ''
              }`}
              onClick={() => handleMountainClick(mountain)}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              aria-pressed={isSelected}
              aria-disabled={isDisabled}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                  e.preventDefault();
                  handleMountainClick(mountain);
                }
              }}
            >
              <div className="mountain-list__checkbox">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // Handled by parent click
                  disabled={isDisabled}
                  tabIndex={-1}
                />
              </div>
              
              <div className="mountain-list__info">
                <h3 className="mountain-list__name">{mountain.name}</h3>
                <div className="mountain-list__details">
                  <span className="mountain-list__height">
                    Height: {mountain.height}m
                  </span>
                  <span className="mountain-list__width">
                    Width: {mountain.width}m
                  </span>
                  {mountain.country && (
                    <span className="mountain-list__location">
                      {mountain.country}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};