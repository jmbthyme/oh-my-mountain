import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MountainList } from '../MountainList';
import type { Mountain } from '../../types';

const mockMountains: Mountain[] = [
  {
    id: 'everest',
    name: 'Mount Everest',
    height: 8849,
    width: 5000,
    country: 'Nepal/China',
    region: 'Himalayas'
  },
  {
    id: 'k2',
    name: 'K2',
    height: 8611,
    width: 4200,
    country: 'Pakistan/China',
    region: 'Karakoram'
  },
  {
    id: 'kangchenjunga',
    name: 'Kangchenjunga',
    height: 8586,
    width: 4800,
    country: 'Nepal/India',
    region: 'Himalayas'
  }
];

describe('MountainList Integration - Task 4 Requirements', () => {
  const defaultProps = {
    mountains: mockMountains,
    selectedMountains: [],
    onMountainToggle: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Requirement 4.1: Keyboard navigation (Tab, Enter, Space) works correctly with new checkbox role', () => {
    it('should allow Tab navigation between checkbox elements', () => {
      render(<MountainList {...defaultProps} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      
      // All checkboxes should be focusable
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('tabIndex', '0');
        expect(checkbox).toHaveAttribute('role', 'checkbox');
      });
    });

    it('should handle Enter key activation on checkbox elements', () => {
      const mockToggle = vi.fn();
      render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      
      // Focus and activate with Enter
      firstCheckbox.focus();
      fireEvent.keyDown(firstCheckbox, { key: 'Enter' });
      
      expect(mockToggle).toHaveBeenCalledWith(mockMountains[0]);
    });

    it('should handle Space key activation on checkbox elements', () => {
      const mockToggle = vi.fn();
      render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      
      // Focus and activate with Space
      firstCheckbox.focus();
      fireEvent.keyDown(firstCheckbox, { key: ' ' });
      
      expect(mockToggle).toHaveBeenCalledWith(mockMountains[0]);
    });

    it('should maintain proper checkbox semantics during keyboard interaction', () => {
      const mockToggle = vi.fn();
      const { rerender } = render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      
      // Initial state
      expect(firstCheckbox).toHaveAttribute('aria-checked', 'false');
      
      // After selection (simulated by re-rendering with selection)
      rerender(
        <MountainList 
          {...defaultProps} 
          selectedMountains={[mockMountains[0]]}
          onMountainToggle={mockToggle} 
        />
      );
      
      const updatedCheckbox = screen.getAllByRole('checkbox')[0];
      expect(updatedCheckbox).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Requirement 4.3: Focus indicators are visible and appropriate for checkbox elements', () => {
    it('should have visible focus indicators when focused', () => {
      render(<MountainList {...defaultProps} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      
      checkboxes.forEach(checkbox => {
        // Focus the element
        checkbox.focus();
        expect(checkbox).toHaveFocus();
        
        // Should have proper CSS classes for focus styling
        expect(checkbox).toHaveClass('mountain-list__item');
        
        // Should have proper role for screen readers
        expect(checkbox).toHaveAttribute('role', 'checkbox');
      });
    });

    it('should have appropriate ARIA labeling for screen readers', () => {
      render(<MountainList {...defaultProps} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      
      checkboxes.forEach((checkbox, index) => {
        // Each checkbox should have proper labeling
        expect(checkbox).toHaveAttribute('aria-labelledby');
        expect(checkbox).toHaveAttribute('aria-describedby');
        
        // Verify the IDs reference actual elements
        const labelId = checkbox.getAttribute('aria-labelledby');
        const descriptionId = checkbox.getAttribute('aria-describedby');
        
        expect(document.getElementById(labelId!)).toBeInTheDocument();
        expect(document.getElementById(descriptionId!)).toBeInTheDocument();
      });
    });

    it('should maintain focus visibility across different states', () => {
      const mockToggle = vi.fn();
      
      // Test with selected mountains
      render(
        <MountainList 
          {...defaultProps} 
          selectedMountains={[mockMountains[0]]}
          onMountainToggle={mockToggle} 
        />
      );
      
      const selectedCheckbox = screen.getAllByRole('checkbox')[0];
      const unselectedCheckbox = screen.getAllByRole('checkbox')[1];
      
      // Both should be focusable regardless of selection state
      expect(selectedCheckbox).toHaveAttribute('tabIndex', '0');
      expect(unselectedCheckbox).toHaveAttribute('tabIndex', '0');
      
      // Focus should work on both
      selectedCheckbox.focus();
      expect(selectedCheckbox).toHaveFocus();
      
      unselectedCheckbox.focus();
      expect(unselectedCheckbox).toHaveFocus();
    });
  });

  describe('Requirement 4.1 & 4.3: aria-disabled properly prevents interaction for disabled items', () => {
    it('should set aria-disabled and tabIndex correctly for disabled items', () => {
      // Create scenario with max selections
      const elevenMountains = Array.from({ length: 11 }, (_, i) => ({
        id: `mountain-${i}`,
        name: `Mountain ${i}`,
        height: 8000 + i,
        width: 4000 + i
      }));
      
      const tenSelected = elevenMountains.slice(0, 10);
      
      render(
        <MountainList 
          mountains={elevenMountains}
          selectedMountains={tenSelected}
          onMountainToggle={vi.fn()} 
        />
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      
      // First 10 should be enabled (can be deselected)
      checkboxes.slice(0, 10).forEach(checkbox => {
        expect(checkbox).toHaveAttribute('aria-disabled', 'false');
        expect(checkbox).toHaveAttribute('tabIndex', '0');
      });
      
      // 11th should be disabled
      const disabledCheckbox = checkboxes.find(checkbox => 
        checkbox.getAttribute('aria-labelledby')?.includes('mountain-10')
      );
      
      expect(disabledCheckbox).toHaveAttribute('aria-disabled', 'true');
      expect(disabledCheckbox).toHaveAttribute('tabIndex', '-1');
    });

    it('should prevent keyboard interaction on disabled items', () => {
      // Create scenario with max selections
      const elevenMountains = Array.from({ length: 11 }, (_, i) => ({
        id: `mountain-${i}`,
        name: `Mountain ${i}`,
        height: 8000 + i,
        width: 4000 + i
      }));
      
      const tenSelected = elevenMountains.slice(0, 10);
      const mockToggle = vi.fn();
      
      render(
        <MountainList 
          mountains={elevenMountains}
          selectedMountains={tenSelected}
          onMountainToggle={mockToggle} 
        />
      );
      
      const disabledCheckbox = screen.getAllByRole('checkbox').find(checkbox => 
        checkbox.getAttribute('aria-labelledby')?.includes('mountain-10')
      );
      
      expect(disabledCheckbox).toBeDefined();
      
      // Try keyboard interactions
      fireEvent.keyDown(disabledCheckbox!, { key: 'Enter' });
      fireEvent.keyDown(disabledCheckbox!, { key: ' ' });
      
      // Should not trigger toggle
      expect(mockToggle).not.toHaveBeenCalled();
    });

    it('should allow keyboard interaction on enabled items even when some are disabled', () => {
      // Create scenario with max selections
      const elevenMountains = Array.from({ length: 11 }, (_, i) => ({
        id: `mountain-${i}`,
        name: `Mountain ${i}`,
        height: 8000 + i,
        width: 4000 + i
      }));
      
      const tenSelected = elevenMountains.slice(0, 10);
      const mockToggle = vi.fn();
      
      render(
        <MountainList 
          mountains={elevenMountains}
          selectedMountains={tenSelected}
          onMountainToggle={mockToggle} 
        />
      );
      
      // Find an enabled checkbox (one of the selected ones)
      const enabledCheckbox = screen.getAllByRole('checkbox').find(checkbox => 
        checkbox.getAttribute('aria-labelledby')?.includes('mountain-0')
      );
      
      expect(enabledCheckbox).toBeDefined();
      expect(enabledCheckbox).toHaveAttribute('aria-disabled', 'false');
      
      // Should allow keyboard interaction
      fireEvent.keyDown(enabledCheckbox!, { key: 'Enter' });
      
      // Should trigger toggle (deselection)
      expect(mockToggle).toHaveBeenCalledWith(elevenMountains[0]);
    });
  });

  describe('Integration: Complete keyboard navigation flow', () => {
    it('should support complete keyboard navigation workflow', () => {
      const mockToggle = vi.fn();
      render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      
      // Tab through all checkboxes
      checkboxes.forEach((checkbox, index) => {
        checkbox.focus();
        expect(checkbox).toHaveFocus();
        
        // Verify proper ARIA attributes
        expect(checkbox).toHaveAttribute('role', 'checkbox');
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
        expect(checkbox).toHaveAttribute('tabIndex', '0');
        
        // Test keyboard activation
        fireEvent.keyDown(checkbox, { key: 'Enter' });
        expect(mockToggle).toHaveBeenCalledWith(mockMountains[index]);
      });
      
      expect(mockToggle).toHaveBeenCalledTimes(3);
    });
  });
});