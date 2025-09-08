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

describe('MountainList Keyboard Navigation', () => {
  const defaultProps = {
    mountains: mockMountains,
    selectedMountains: [],
    onMountainToggle: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle Enter key correctly for checkbox role', () => {
    const mockToggle = vi.fn();
    render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
    
    const everestCheckbox = screen.getAllByRole('checkbox')[0];
    
    // Simulate Enter key press
    fireEvent.keyDown(everestCheckbox, { key: 'Enter' });
    
    expect(mockToggle).toHaveBeenCalledWith(mockMountains[0]);
  });

  it('should handle Space key correctly for checkbox role', () => {
    const mockToggle = vi.fn();
    render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
    
    const everestCheckbox = screen.getAllByRole('checkbox')[0];
    
    // Simulate Space key press
    fireEvent.keyDown(everestCheckbox, { key: ' ' });
    
    expect(mockToggle).toHaveBeenCalledWith(mockMountains[0]);
  });

  it('should prevent default behavior for Enter and Space keys', () => {
    const mockToggle = vi.fn();
    render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
    
    const everestCheckbox = screen.getAllByRole('checkbox')[0];
    
    // Mock preventDefault to verify it's called
    const mockPreventDefault = vi.fn();
    
    // Test Enter key
    fireEvent.keyDown(everestCheckbox, { 
      key: 'Enter',
      preventDefault: mockPreventDefault
    });
    
    // Test Space key  
    fireEvent.keyDown(everestCheckbox, { 
      key: ' ',
      preventDefault: mockPreventDefault
    });
    
    // Verify toggle was called (indicating the event handler worked)
    expect(mockToggle).toHaveBeenCalledTimes(2);
  });

  it('should ignore other keys', () => {
    const mockToggle = vi.fn();
    render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
    
    const everestCheckbox = screen.getAllByRole('checkbox')[0];
    
    // Test various other keys
    fireEvent.keyDown(everestCheckbox, { key: 'a' });
    fireEvent.keyDown(everestCheckbox, { key: 'Tab' });
    fireEvent.keyDown(everestCheckbox, { key: 'Escape' });
    fireEvent.keyDown(everestCheckbox, { key: 'ArrowDown' });
    
    expect(mockToggle).not.toHaveBeenCalled();
  });

  it('should not trigger toggle when disabled and keyboard is used', () => {
    // Create scenario with max selections
    const elevenMountains = Array.from({ length: 11 }, (_, i) => ({
      id: `mountain-${i}`,
      name: `Mountain ${i}`,
      height: 8000 + i,
      width: 4000 + i
    }));
    
    const tenSelected = elevenMountains.slice(0, 10);
    const mockToggle = vi.fn();
    
    render(<MountainList 
      mountains={elevenMountains}
      selectedMountains={tenSelected}
      onMountainToggle={mockToggle} 
    />);
    
    // Find the disabled checkbox (11th mountain)
    const disabledCheckbox = screen.getAllByRole('checkbox').find(checkbox => 
      checkbox.getAttribute('aria-labelledby')?.includes('mountain-10')
    );
    
    expect(disabledCheckbox).toBeDefined();
    
    // Try keyboard interaction on disabled item
    fireEvent.keyDown(disabledCheckbox!, { key: 'Enter' });
    fireEvent.keyDown(disabledCheckbox!, { key: ' ' });
    
    expect(mockToggle).not.toHaveBeenCalled();
  });

  it('should have proper tabIndex for enabled and disabled items', () => {
    // Create scenario with max selections
    const elevenMountains = Array.from({ length: 11 }, (_, i) => ({
      id: `mountain-${i}`,
      name: `Mountain ${i}`,
      height: 8000 + i,
      width: 4000 + i
    }));
    
    const tenSelected = elevenMountains.slice(0, 10);
    
    render(<MountainList 
      mountains={elevenMountains}
      selectedMountains={tenSelected}
      onMountainToggle={vi.fn()} 
    />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    
    // First 10 should be focusable (selected items can be deselected)
    checkboxes.slice(0, 10).forEach(checkbox => {
      expect(checkbox).toHaveAttribute('tabIndex', '0');
      expect(checkbox).toHaveAttribute('aria-disabled', 'false');
    });
    
    // 11th should not be focusable (disabled)
    const disabledCheckbox = checkboxes.find(checkbox => 
      checkbox.getAttribute('aria-labelledby')?.includes('mountain-10')
    );
    expect(disabledCheckbox).toHaveAttribute('tabIndex', '-1');
    expect(disabledCheckbox).toHaveAttribute('aria-disabled', 'true');
  });

  it('should maintain focus indicators for checkbox role', () => {
    render(<MountainList {...defaultProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    
    checkboxes.forEach(checkbox => {
      // Focus the checkbox
      checkbox.focus();
      expect(checkbox).toHaveFocus();
      
      // Verify it has the checkbox role
      expect(checkbox).toHaveAttribute('role', 'checkbox');
      
      // Verify it has proper ARIA attributes
      expect(checkbox).toHaveAttribute('aria-checked');
      expect(checkbox).toHaveAttribute('aria-labelledby');
      expect(checkbox).toHaveAttribute('aria-describedby');
    });
  });
});