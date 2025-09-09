import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MountainList } from '../MountainList';
import type { MountainWithCalculatedWidth } from '../../types/Mountain';
import { MountainShape } from '../../utils/shapeCalculator';

// Mock mountain data for testing with calculated widths
const mockMountains: MountainWithCalculatedWidth[] = [
  {
    id: 'everest',
    name: 'Mount Everest',
    height: 8849,
    shape: MountainShape.CONICAL,
    width: 10200, // Calculated width for conical shape
    country: 'Nepal/China',
    region: 'Himalayas'
  },
  {
    id: 'k2',
    name: 'K2',
    height: 8611,
    shape: MountainShape.CONICAL,
    width: 9930, // Calculated width for conical shape
    country: 'Pakistan/China',
    region: 'Karakoram'
  },
  {
    id: 'kangchenjunga',
    name: 'Kangchenjunga',
    height: 8586,
    shape: MountainShape.DOME_SHAPED,
    width: 8950, // Calculated width for dome shape
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

  it('displays mountain details correctly with calculated widths', () => {
    render(<MountainList {...defaultProps} />);
    
    // Check height formatting - using regex to handle potential locale differences
    expect(screen.getByText(/Height:\s*8849\s*m/)).toBeInTheDocument();
    expect(screen.getByText(/Height:\s*8611\s*m/)).toBeInTheDocument();
    
    // Check calculated width formatting with (calculated) indicator - using regex
    expect(screen.getByText(/Width:\s*10[.,]?200\s*m \(calculated\)/)).toBeInTheDocument();
    expect(screen.getByText(/Width:\s*9930\s*m \(calculated\)/)).toBeInTheDocument();
    
    // Check shape information - use getAllByText since there are multiple conical mountains
    expect(screen.getAllByText('Shape: conical')).toHaveLength(2); // Everest and K2 are both conical
    expect(screen.getByText('Shape: dome shaped')).toBeInTheDocument();
    
    // Check country information
    expect(screen.getByText('Nepal/China')).toBeInTheDocument();
    expect(screen.getByText('Pakistan/China')).toBeInTheDocument();
  });

  it('calls onMountainToggle when a mountain is clicked', () => {
    const mockToggle = vi.fn();
    render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
    
    const everestItem = screen.getAllByRole('checkbox').find(checkbox => 
      checkbox.getAttribute('aria-labelledby')?.includes('everest')
    );
    
    expect(everestItem).toBeDefined();
    fireEvent.click(everestItem!);
    
    expect(mockToggle).toHaveBeenCalledWith(mockMountains[0]);
  });

  it('handles keyboard navigation with Enter key', () => {
    const mockToggle = vi.fn();
    render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
    
    const everestItem = screen.getAllByRole('checkbox').find(checkbox => 
      checkbox.getAttribute('aria-labelledby')?.includes('everest')
    );
    
    expect(everestItem).toBeDefined();
    fireEvent.keyDown(everestItem!, { key: 'Enter' });
    
    expect(mockToggle).toHaveBeenCalledWith(mockMountains[0]);
  });

  it('handles keyboard navigation with Space key', () => {
    const mockToggle = vi.fn();
    render(<MountainList {...defaultProps} onMountainToggle={mockToggle} />);
    
    const everestItem = screen.getAllByRole('checkbox').find(checkbox => 
      checkbox.getAttribute('aria-labelledby')?.includes('everest')
    );
    
    expect(everestItem).toBeDefined();
    fireEvent.keyDown(everestItem!, { key: ' ' });
    
    expect(mockToggle).toHaveBeenCalledWith(mockMountains[0]);
  });

  it('shows selected mountains with proper styling and checkboxes', () => {
    const selectedMountains = [mockMountains[0], mockMountains[1]];
    render(<MountainList {...defaultProps} selectedMountains={selectedMountains} />);
    
    expect(screen.getByText('2 of 10 selected')).toBeInTheDocument();
    
    // Check that checkboxes have proper aria-checked state for selected mountains
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true'); // Mount Everest
    expect(checkboxes[1]).toHaveAttribute('aria-checked', 'true'); // K2
    expect(checkboxes[2]).toHaveAttribute('aria-checked', 'false'); // Kangchenjunga
  });

  it('shows warning message when maximum selections reached', () => {
    // Create 10 mountains to reach the limit
    const tenMountains = Array.from({ length: 10 }, (_, i) => ({
      id: `mountain-${i}`,
      name: `Mountain ${i}`,
      height: 8000 + i,
      shape: MountainShape.CONICAL,
      width: 9238 + i // Calculated width for conical shape
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
      shape: MountainShape.CONICAL,
      width: 9238 + i // Calculated width for conical shape
    }));
    
    const tenSelected = elevenMountains.slice(0, 10);
    const mockToggle = vi.fn();
    
    render(<MountainList 
      mountains={elevenMountains}
      selectedMountains={tenSelected}
      onMountainToggle={mockToggle} 
    />);
    
    // Try to click the 11th mountain (not selected)
    const eleventhMountain = screen.getAllByRole('checkbox').find(checkbox => 
      checkbox.getAttribute('aria-labelledby')?.includes('mountain-10')
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
      shape: MountainShape.CONICAL,
      width: 9238 + i // Calculated width for conical shape
    }));
    
    const mockToggle = vi.fn();
    
    render(<MountainList 
      mountains={tenMountains}
      selectedMountains={tenMountains}
      onMountainToggle={mockToggle} 
    />);
    
    // Click on a selected mountain to deselect it
    const firstMountain = screen.getAllByRole('checkbox').find(checkbox => 
      checkbox.getAttribute('aria-labelledby')?.includes('mountain-0')
    );
    
    expect(firstMountain).toBeDefined();
    fireEvent.click(firstMountain!);
    
    // Should call toggle function to deselect
    expect(mockToggle).toHaveBeenCalledWith(tenMountains[0]);
  });

  it('has proper accessibility attributes', () => {
    const selectedMountains = [mockMountains[0]];
    render(<MountainList {...defaultProps} selectedMountains={selectedMountains} />);
    
    const mountainItems = screen.getAllByRole('checkbox');
    
    // Check first item (selected)
    const selectedItem = mountainItems.find(checkbox => 
      checkbox.getAttribute('aria-labelledby')?.includes('everest')
    );
    expect(selectedItem).toHaveAttribute('aria-checked', 'true');
    expect(selectedItem).toHaveAttribute('tabIndex', '0');
    expect(selectedItem).toHaveAttribute('aria-labelledby');
    expect(selectedItem).toHaveAttribute('aria-describedby');
    
    // Check second item (not selected)
    const unselectedItem = mountainItems.find(checkbox => 
      checkbox.getAttribute('aria-labelledby')?.includes('k2')
    );
    expect(unselectedItem).toHaveAttribute('aria-checked', 'false');
    expect(unselectedItem).toHaveAttribute('tabIndex', '0');
  });

  it('disables keyboard interaction for disabled items', () => {
    // Create scenario with max selections
    const elevenMountains = Array.from({ length: 11 }, (_, i) => ({
      id: `mountain-${i}`,
      name: `Mountain ${i}`,
      height: 8000 + i,
      shape: MountainShape.CONICAL,
      width: 9238 + i // Calculated width for conical shape
    }));
    
    const tenSelected = elevenMountains.slice(0, 10);
    const mockToggle = vi.fn();
    
    render(<MountainList 
      mountains={elevenMountains}
      selectedMountains={tenSelected}
      onMountainToggle={mockToggle} 
    />);
    
    const disabledItem = screen.getAllByRole('checkbox').find(checkbox => 
      checkbox.getAttribute('aria-labelledby')?.includes('mountain-10')
    );
    
    expect(disabledItem).toBeDefined();
    
    // Should have tabIndex -1 when disabled
    expect(disabledItem).toHaveAttribute('tabIndex', '-1');
    expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
    
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
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  describe('Shape-Based Width Display Integration', () => {
    it('displays different mountain shapes with their calculated widths', () => {
      const shapeMountains: MountainWithCalculatedWidth[] = [
        {
          id: 'conical-test',
          name: 'Conical Mountain',
          height: 5000,
          shape: MountainShape.CONICAL,
          width: 5774, // Calculated conical width
          country: 'Test Country'
        },
        {
          id: 'dome-test',
          name: 'Dome Mountain',
          height: 5000,
          shape: MountainShape.DOME_SHAPED,
          width: 6000, // Calculated dome width
          country: 'Test Country'
        },
        {
          id: 'ridge-test',
          name: 'Ridge Mountain',
          height: 5000,
          shape: MountainShape.RIDGE,
          width: 4000, // Calculated ridge width
          country: 'Test Country'
        },
        {
          id: 'plateau-test',
          name: 'Plateau Mountain',
          height: 5000,
          shape: MountainShape.PLATEAU,
          width: 6000, // Calculated plateau width
          country: 'Test Country'
        }
      ];

      render(<MountainList 
        mountains={shapeMountains}
        selectedMountains={[]}
        onMountainToggle={vi.fn()}
      />);

      // Check that all shapes are displayed correctly
      expect(screen.getByText('Shape: conical')).toBeInTheDocument();
      expect(screen.getByText('Shape: dome shaped')).toBeInTheDocument();
      expect(screen.getByText('Shape: ridge')).toBeInTheDocument();
      expect(screen.getByText('Shape: plateau')).toBeInTheDocument();

      // Check that calculated widths are displayed with proper formatting - using regex
      expect(screen.getByText(/Width:\s*5774\s*m \(calculated\)/)).toBeInTheDocument();
      expect(screen.getAllByText(/Width:\s*6000\s*m \(calculated\)/)).toHaveLength(2); // Both dome and plateau have 6000m
      expect(screen.getByText(/Width:\s*4000\s*m \(calculated\)/)).toBeInTheDocument();
    });

    it('handles mountain selection with calculated widths', () => {
      const mockToggle = vi.fn();
      const mountainWithCalculatedWidth: MountainWithCalculatedWidth = {
        id: 'calc-mountain',
        name: 'Calculated Mountain',
        height: 3000,
        shape: MountainShape.DOME_SHAPED,
        width: 3600, // Calculated dome width
        country: 'Test Country'
      };

      render(<MountainList 
        mountains={[mountainWithCalculatedWidth]}
        selectedMountains={[]}
        onMountainToggle={mockToggle}
      />);

      const mountainItem = screen.getByRole('checkbox');
      fireEvent.click(mountainItem);

      expect(mockToggle).toHaveBeenCalledWith(mountainWithCalculatedWidth);
    });

    it('displays rounded calculated widths correctly', () => {
      const mountainWithDecimalWidth: MountainWithCalculatedWidth = {
        id: 'decimal-mountain',
        name: 'Decimal Mountain',
        height: 2500,
        shape: MountainShape.CONICAL,
        width: 2887.5, // Width with decimal
        country: 'Test Country'
      };

      render(<MountainList 
        mountains={[mountainWithDecimalWidth]}
        selectedMountains={[]}
        onMountainToggle={vi.fn()}
      />);

      // Should round to nearest integer - using regex to handle locale differences
      expect(screen.getByText(/Width:\s*2888\s*m \(calculated\)/)).toBeInTheDocument();
    });

    it('handles shape names with hyphens correctly', () => {
      const domeShapeMountain: MountainWithCalculatedWidth = {
        id: 'dome-mountain',
        name: 'Dome Mountain',
        height: 4000,
        shape: MountainShape.DOME_SHAPED,
        width: 4800,
        country: 'Test Country'
      };

      render(<MountainList 
        mountains={[domeShapeMountain]}
        selectedMountains={[]}
        onMountainToggle={vi.fn()}
      />);

      // Should replace hyphens with spaces
      expect(screen.getByText('Shape: dome shaped')).toBeInTheDocument();
    });

    it('maintains selection functionality with calculated widths', () => {
      const mountainsWithWidths: MountainWithCalculatedWidth[] = [
        {
          id: 'mountain-1',
          name: 'Mountain 1',
          height: 3000,
          shape: MountainShape.CONICAL,
          width: 3464,
        },
        {
          id: 'mountain-2',
          name: 'Mountain 2',
          height: 4000,
          shape: MountainShape.PLATEAU,
          width: 4800,
        }
      ];

      const selectedMountains = [mountainsWithWidths[0]];
      
      render(<MountainList 
        mountains={mountainsWithWidths}
        selectedMountains={selectedMountains}
        onMountainToggle={vi.fn()}
      />);

      expect(screen.getByText('1 of 10 selected')).toBeInTheDocument();

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true');
      expect(checkboxes[1]).toHaveAttribute('aria-checked', 'false');
    });
  });
});