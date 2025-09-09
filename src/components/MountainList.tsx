import React from 'react';
import type { MountainListProps } from '../types';
import type { MountainWithCalculatedWidth } from '../types/Mountain';
import { generateAccessibilityIds, buildMountainAriaAttributes, buildMountainAriaLabel } from '../utils/accessibility';
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

  const handleMountainClick = (mountain: MountainWithCalculatedWidth) => {
    const isSelected = selectedIds.has(mountain.id);
    
    // If not selected and at max limit, don't allow selection
    if (!isSelected && isAtMaxSelections) {
      return;
    }
    
    onMountainToggle(mountain);
  };

  return (
    <div className="mountain-list" data-testid="mountain-list">
      <div className="mountain-list__header">
        <h2>Available Mountains</h2>
        <div className="mountain-list__selection-info" data-testid="selected-count">
          {selectedMountains.length} of {maxSelections} selected
        </div>
      </div>
      
      {isAtMaxSelections && (
        <div className="mountain-list__warning" role="alert" data-testid="toast">
          Maximum of {maxSelections} mountains can be selected for comparison
        </div>
      )}
      
      <div className="mountain-list__items">
        {mountains.map((mountain) => {
          const isSelected = selectedIds.has(mountain.id);
          const isDisabled = !isSelected && isAtMaxSelections;
          const accessibilityIds = generateAccessibilityIds(mountain.id);
          const ariaAttributes = buildMountainAriaAttributes({
            mountainId: mountain.id,
            isSelected,
            isDisabled,
            useCheckboxRole: true,
          });
          
          const ariaLabel = buildMountainAriaLabel({
            mountainName: mountain.name,
            height: mountain.height,
            width: mountain.width,
            shape: mountain.shape,
            country: mountain.country,
            isSelected,
          });
          
          return (
            <div
              key={mountain.id}
              className={`mountain-list__item ${
                isSelected ? 'mountain-list__item--selected' : ''
              } ${
                isDisabled ? 'mountain-list__item--disabled' : ''
              }`}
              data-testid={`mountain-item-${mountain.id}`}
              onClick={() => handleMountainClick(mountain)}
              {...ariaAttributes}
              aria-label={ariaLabel}
              onKeyDown={(e) => {
                // Handle keyboard navigation for checkbox role
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!isDisabled) {
                    handleMountainClick(mountain);
                  }
                }
              }}
            >
              <div className="mountain-list__checkbox" aria-hidden="true">
                <div className="mountain-list__checkbox-indicator"></div>
              </div>
              
              <div className="mountain-list__info">
                <h3 className="mountain-list__name" id={accessibilityIds.nameId}>
                  {mountain.name}
                </h3>
                <div className="mountain-list__details" id={accessibilityIds.detailsId}>
                  <span className="mountain-list__height">
                    Height: {mountain.height.toLocaleString()}m
                  </span>
                  <span className="mountain-list__width">
                    Width: {Math.round(mountain.width).toLocaleString()}m (calculated)
                  </span>
                  <span className="mountain-list__shape">
                    Shape: {mountain.shape.replace('-', ' ')}
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

export default MountainList;