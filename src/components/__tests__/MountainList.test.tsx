import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MountainList } from '../MountainList';
import type { Mountain } from '../../types';

// Mock mountain data for testing
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

describe('MountainList', () => {
  const defaultProps = {
    mountains: mockMountains,
    selectedMountains: [],
    onMountainToggle: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the component with header and mountain list', () => {
    render(<MountainList {...defaultProps} />);
    
    expect(screen.getByText('Available Mountains')).toBeInTheDocument();
    expect(screen.getByText('0 of 10 selected')).toBeInTheDocument();
    expect(screen.getByText('Mount Everest')).toBeInTheDocument();
    expect(screen.getByText('K2')).toBeInTheDocument();
    expect(screen.getByText('Kangchenjunga')).toBeInTheDocument();
  });

  it('displays mountain details correctly', () => {
    render(<MountainList {...defaultProps} />);
    
    // Check height formatting (without commas since toLocaleString was removed)
    expect(screen.getByText('Height: 8849m')).toBeInTheDocument();
    expect(screen.getByText('Height: 8611m')).toBeInTheDocument();
    
    // Check width formatting  
    expect(screen.getByText('Width: 5000m')).toBeInTheDocument();
    expect(screen.getByText('Width: 4200m')).toBeInTheDocument();
    
    // Check country information
    expect(screen.getByText('Nepal/China')).toBeInTheDocument();
    expect(screen.getByText('Pakistan/China')).toBeInTheDocument();
  });

  it('calls onMountainToggle when a mountain is clicked', () => {
    const mockToggle = vi.fn();
    render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
    
    const everestItem = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('Mount Everest')
    );
    
    expect(everestItem).toBeDefined();
    fireEvent.click(everestItem!);
    
    expect(mockToggle).toHaveBeenCalledWith(mockMountains[0]);
  });

  it('handles keyboard navigation with Enter key', () => {
    const mockToggle = vi.fn();
    render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
    
    const everestItem = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('Mount Everest')
    );
    
    expect(everestItem).toBeDefined();
    fireEvent.keyDown(everestItem!, { key: 'Enter' });
    
    expect(mockToggle).toHaveBeenCalledWith(mockMountains[0]);
  });

  it('handles keyboard navigation with Space key', () => {
    const mockToggle = vi.fn();
    render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
    
    const everestItem = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('Mount Everest')
    );
    
    expect(everestItem).toBeDefined();
    fireEvent.keyDown(everestItem!, { key: ' ' });
    
    expect(mockToggle).toHaveBeenCalledWith(mockMountains[0]);
  });

  it('shows selected mountains with proper styling and checkboxes', () => {
    const selectedMountains = [mockMountains[0], mockMountains[1]];
    render(<MountainList {...defaultProps} selectedMountains={selectedMountains} />);
    
    expect(screen.getByText('2 of 10 selected')).toBeInTheDocument();
    
    // Check that checkboxes are checked for selected mountains
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked(); // Mount Everest
    expect(checkboxes[1]).toBeChecked(); // K2
    expect(checkboxes[2]).not.toBeChecked(); // Kangchenjunga
  });

  it('shows warning message when maximum selections reached', () => {
    // Create 10 mountains to reach the limit
    const tenMountains = Array.from({ length: 10 }, (_, i) => ({
      id: `mountain-${i}`,
      name: `Mountain ${i}`,
      height: 8000 + i,
      width: 4000 + i
    }));
    
    render(<MountainList 
      {...defaultProps} 
      mountains={tenMountains}
      selectedMountains={tenMountains} 
    />);
    
    expect(screen.getByText('10 of 10 selected')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Maximum of 10 mountains can be selected for comparison'
    );
  });

  it('prevents selection when at maximum limit', () => {
    // Create 11 mountains, select first 10
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
    
    // Try to click the 11th mountain (not selected)
    const eleventhMountain = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('Mountain 10')
    );
    
    expect(eleventhMountain).toBeDefined();
    fireEvent.click(eleventhMountain!);
    
    // Should not call toggle function
    expect(mockToggle).not.toHaveBeenCalled();
    
    // Check that the item is disabled
    expect(eleventhMountain).toHaveAttribute('aria-disabled', 'true');
  });

  it('allows deselection when at maximum limit', () => {
    // Create 10 mountains, all selected
    const tenMountains = Array.from({ length: 10 }, (_, i) => ({
      id: `mountain-${i}`,
      name: `Mountain ${i}`,
      height: 8000 + i,
      width: 4000 + i
    }));
    
    const mockToggle = vi.fn();
    
    render(<MountainList 
      mountains={tenMountains}
      selectedMountains={tenMountains}
      onMountainToggle={mockToggle} 
    />);
    
    // Click on a selected mountain to deselect it
    const firstMountain = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('Mountain 0')
    );
    
    expect(firstMountain).toBeDefined();
    fireEvent.click(firstMountain!);
    
    // Should call toggle function to deselect
    expect(mockToggle).toHaveBeenCalledWith(tenMountains[0]);
  });

  it('has proper accessibility attributes', () => {
    const selectedMountains = [mockMountains[0]];
    render(<MountainList {...defaultProps} selectedMountains={selectedMountains} />);
    
    const mountainItems = screen.getAllByRole('button');
    
    // Check first item (selected)
    const selectedItem = mountainItems.find(button => 
      button.textContent?.includes('Mount Everest')
    );
    expect(selectedItem).toHaveAttribute('aria-pressed', 'true');
    expect(selectedItem).toHaveAttribute('tabIndex', '0');
    
    // Check second item (not selected)
    const unselectedItem = mountainItems.find(button => 
      button.textContent?.includes('K2')
    );
    expect(unselectedItem).toHaveAttribute('aria-pressed', 'false');
    expect(unselectedItem).toHaveAttribute('tabIndex', '0');
  });

  it('disables keyboard interaction for disabled items', () => {
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
    
    const disabledItem = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('Mountain 10')
    );
    
    expect(disabledItem).toBeDefined();
    
    // Should have tabIndex -1 when disabled
    expect(disabledItem).toHaveAttribute('tabIndex', '-1');
    
    // Keyboard events should not trigger toggle
    fireEvent.keyDown(disabledItem!, { key: 'Enter' });
    fireEvent.keyDown(disabledItem!, { key: ' ' });
    
    expect(mockToggle).not.toHaveBeenCalled();
  });

  it('renders empty state when no mountains provided', () => {
    render(<MountainList {...defaultProps} mountains={[]} />);
    
    expect(screen.getByText('Available Mountains')).toBeInTheDocument();
    expect(screen.getByText('0 of 10 selected')).toBeInTheDocument();
    // Should not have any mountain items
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});