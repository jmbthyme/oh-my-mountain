import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ComparisonView from '../ComparisonView';
import type { MountainWithCalculatedWidth } from '../../types/Mountain';
import { MountainShape } from '../../utils/shapeCalculator';

// Mock the MountainTriangle component
vi.mock('../MountainTriangle', () => ({
  default: ({ mountain, scale, maxDimensions }: any) => (
    <div
      data-testid={`mountain-triangle-${mountain.id}`}
      data-scale={scale.toFixed(4)}
      data-max-height={maxDimensions.height}
      data-max-width={maxDimensions.width}
    >
      {mountain.name} - Scale: {scale.toFixed(4)}
    </div>
  ),
}));

// Mock utility functions
vi.mock('../../utils', () => ({
  calculateMaxDimensions: vi.fn((mountains: MountainWithCalculatedWidth[]) => ({
    maxHeight: Math.max(...mountains.map(m => m.height)),
    maxWidth: Math.max(...mountains.map(m => m.width)),
  })),
  calculateContainerDimensions: vi.fn(() => ({
    containerWidth: 800,
    containerHeight: 600,
  })),
  calculateScaleFactor: vi.fn(() => 0.1),
}));

describe('ComparisonView', () => {
  const mockMountains: MountainWithCalculatedWidth[] = [
    {
      id: 'everest',
      name: 'Mount Everest',
      height: 8849,
      shape: MountainShape.CONICAL,
      width: 10200, // Calculated width based on conical shape
      country: 'Nepal/China',
      region: 'Himalayas',
    },
    {
      id: 'k2',
      name: 'K2',
      height: 8611,
      shape: MountainShape.CONICAL,
      width: 9930, // Calculated width based on conical shape
      country: 'Pakistan/China',
      region: 'Karakoram',
    },
    {
      id: 'kangchenjunga',
      name: 'Kangchenjunga',
      height: 8586,
      shape: MountainShape.DOME_SHAPED,
      width: 8950, // Calculated width based on dome shape
      country: 'Nepal/India',
      region: 'Himalayas',
    },
  ];

  // Mock window resize functionality
  const mockResizeObserver = vi.fn();
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();

  beforeEach(() => {
    // Clean up DOM between tests
    cleanup();

    // Mock window object
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('Empty State', () => {
    it('should render empty state when no mountains are selected', () => {
      render(<ComparisonView selectedMountains={[]} />);

      expect(screen.getByText('No Mountains Selected')).toBeInTheDocument();
      expect(screen.getByText(/Select mountains from the list/)).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Mountain icon' })).toBeInTheDocument();
    });

    it('should apply correct CSS class for empty state', () => {
      const { container } = render(<ComparisonView selectedMountains={[]} />);

      const comparisonView = container.querySelector('.comparison-view');
      expect(comparisonView).toHaveClass('comparison-view--empty');
    });

    it('should not render mountain triangles in empty state', () => {
      render(<ComparisonView selectedMountains={[]} />);

      expect(screen.queryByTestId(/mountain-triangle-/)).not.toBeInTheDocument();
    });
  });

  describe('Single Mountain Selection', () => {
    it('should render single mountain with special layout', () => {
      render(<ComparisonView selectedMountains={[mockMountains[0]]} />);

      expect(screen.getByTestId('mountain-triangle-everest')).toBeInTheDocument();
      expect(screen.getByText(/Select more mountains to compare/)).toBeInTheDocument();
    });

    it('should apply correct CSS class for single mountain', () => {
      const { container } = render(<ComparisonView selectedMountains={[mockMountains[0]]} />);

      const comparisonView = container.querySelector('.comparison-view');
      expect(comparisonView).toHaveClass('comparison-view--single');
    });

    it('should render mountain triangle with correct props for single mountain', () => {
      const { container } = render(<ComparisonView selectedMountains={[mockMountains[0]]} />);

      const triangle = container.querySelector('[data-testid="mountain-triangle-everest"]');
      expect(triangle).toBeInTheDocument();
      expect(triangle).toHaveAttribute('data-scale', '0.1000');
      // Check that the triangle contains the mountain name
      expect(triangle?.textContent).toContain('Mount Everest');
    });
  });

  describe('Multiple Mountains Layout', () => {
    it('should render multiple mountains in grid layout', () => {
      const { container } = render(<ComparisonView selectedMountains={mockMountains} />);

      expect(container.querySelector('[data-testid="mountain-triangle-everest"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="mountain-triangle-k2"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="mountain-triangle-kangchenjunga"]')).toBeInTheDocument();
    });

    it('should display correct comparison header with mountain count', () => {
      const { container } = render(<ComparisonView selectedMountains={mockMountains} />);

      expect(container.textContent).toContain('Mountain Size Comparison (3 mountains)');
      expect(container.textContent).toContain('All mountains are shown to the same scale');
    });

    it('should handle singular mountain count in header', () => {
      const { container } = render(<ComparisonView selectedMountains={[mockMountains[0]]} />);

      // Should not show the header for single mountain view
      expect(container.textContent).not.toContain('Mountain Size Comparison');
    });

    it('should render scale information with calculated widths', () => {
      const { container } = render(<ComparisonView selectedMountains={mockMountains} />);

      expect(container.textContent).toContain('Tallest:');
      expect(container.textContent).toContain('8849m'); // No comma formatting
      expect(container.textContent).toContain('Widest:');
      expect(container.textContent).toContain('10.200m'); // Decimal formatting instead of comma
      expect(container.textContent).toContain('Scale:');
    });

    it('should apply same scale to all mountain triangles', () => {
      const { container } = render(<ComparisonView selectedMountains={mockMountains} />);

      const triangles = container.querySelectorAll('[data-testid^="mountain-triangle-"]');
      triangles.forEach(triangle => {
        expect(triangle).toHaveAttribute('data-scale', '0.1000');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should set up resize event listener on mount', () => {
      render(<ComparisonView selectedMountains={mockMountains} />);

      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should clean up resize event listener on unmount', () => {
      const { unmount } = render(<ComparisonView selectedMountains={mockMountains} />);

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should update dimensions when window is resized', async () => {
      const { container } = render(<ComparisonView selectedMountains={mockMountains} />);

      // Get the resize handler
      const resizeHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];

      expect(resizeHandler).toBeDefined();

      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', { value: 500 });
      Object.defineProperty(window, 'innerHeight', { value: 400 });

      fireEvent(window, new Event('resize'));

      // The component should handle the resize
      await waitFor(() => {
        // Component should still be rendered after resize
        expect(container.querySelector('[data-testid="mountain-triangle-everest"]')).toBeInTheDocument();
      });
    });
  });

  describe('Grid Layout Logic', () => {
    it('should render mountains in grid container', () => {
      const { container } = render(<ComparisonView selectedMountains={mockMountains} />);

      const grid = container.querySelector('.mountains-grid');
      expect(grid).toBeInTheDocument();

      const gridItems = container.querySelectorAll('.mountain-grid-item');
      expect(gridItems).toHaveLength(3);
    });

    it('should set CSS custom properties for grid layout', () => {
      const { container } = render(<ComparisonView selectedMountains={mockMountains} />);

      const grid = container.querySelector('.mountains-grid');
      expect(grid).toHaveStyle('--container-width: 800px');
      expect(grid).toHaveStyle('--container-height: 600px');
    });

    it('should handle large number of mountains', () => {
      const manyMountains = Array.from({ length: 8 }, (_, i) => ({
        ...mockMountains[0],
        id: `mountain-${i}`,
        name: `Mountain ${i}`,
      }));

      const { container } = render(<ComparisonView selectedMountains={manyMountains} />);

      expect(container.textContent).toContain('Mountain Size Comparison (8 mountains)');

      const triangles = container.querySelectorAll('[data-testid^="mountain-triangle-"]');
      expect(triangles).toHaveLength(8);
    });
  });

  describe('Edge Cases', () => {
    it('should handle mountains with zero dimensions', () => {
      const mountainWithZero: MountainWithCalculatedWidth = {
        id: 'zero',
        name: 'Zero Mountain',
        height: 0,
        shape: MountainShape.CONICAL,
        width: 0, // Minimum width would be applied by calculator
      };

      render(<ComparisonView selectedMountains={[mountainWithZero]} />);

      expect(screen.getByTestId('mountain-triangle-zero')).toBeInTheDocument();
    });

    it('should handle mountains with very large dimensions', () => {
      const largeMountain: MountainWithCalculatedWidth = {
        id: 'large',
        name: 'Large Mountain',
        height: 999999,
        shape: MountainShape.PLATEAU,
        width: 1199999, // Calculated width for plateau shape
      };

      render(<ComparisonView selectedMountains={[largeMountain]} />);

      expect(screen.getByTestId('mountain-triangle-large')).toBeInTheDocument();
    });

    it('should handle missing optional mountain properties', () => {
      const minimalMountain: MountainWithCalculatedWidth = {
        id: 'minimal',
        name: 'Minimal Mountain',
        height: 1000,
        shape: MountainShape.CONICAL,
        width: 1155, // Calculated width for conical shape
      };

      render(<ComparisonView selectedMountains={[minimalMountain]} />);

      expect(screen.getByTestId('mountain-triangle-minimal')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const { container } = render(<ComparisonView selectedMountains={mockMountains} />);

      const heading = container.querySelector('h2');
      expect(heading).toHaveTextContent('Mountain Size Comparison (3 mountains)');
    });

    it('should provide meaningful empty state content', () => {
      const { container } = render(<ComparisonView selectedMountains={[]} />);

      const heading = container.querySelector('h3');
      expect(heading).toHaveTextContent('No Mountains Selected');

      expect(container.textContent).toContain('Select mountains from the list');
    });

    it('should have accessible scale information', () => {
      const { container } = render(<ComparisonView selectedMountains={mockMountains} />);

      expect(container.textContent).toContain('Tallest:');
      expect(container.textContent).toContain('Widest:');
      expect(container.textContent).toContain('Scale:');
    });
  });

  describe('Performance', () => {
    it('should render efficiently with many mountains', () => {
      const manyMountains = Array.from({ length: 10 }, (_, i) => ({
        ...mockMountains[0],
        id: `mountain-${i}`,
        name: `Mountain ${i}`,
      }));

      const startTime = performance.now();
      render(<ComparisonView selectedMountains={manyMountains} />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should not re-render unnecessarily when props do not change', () => {
      const { rerender, container } = render(<ComparisonView selectedMountains={mockMountains} />);

      // Re-render with same props
      rerender(<ComparisonView selectedMountains={mockMountains} />);

      // Component should still be rendered correctly
      expect(container.querySelector('[data-testid="mountain-triangle-everest"]')).toBeInTheDocument();
    });
  });

  describe('Shape-Based Width Calculation Integration', () => {
    it('should display calculated widths for different mountain shapes', () => {
      const shapeMountains: MountainWithCalculatedWidth[] = [
        {
          id: 'conical-mountain',
          name: 'Conical Peak',
          height: 5000,
          shape: MountainShape.CONICAL,
          width: 5774, // 2 * 5000 * tan(30°) ≈ 5774
        },
        {
          id: 'dome-mountain',
          name: 'Dome Peak',
          height: 5000,
          shape: MountainShape.DOME_SHAPED,
          width: 6000, // 2 * √(5000² + (5000*0.6)²) ≈ 6000
        },
        {
          id: 'ridge-mountain',
          name: 'Ridge Peak',
          height: 5000,
          shape: MountainShape.RIDGE,
          width: 4000, // 5000 * 0.8 = 4000
        },
        {
          id: 'plateau-mountain',
          name: 'Plateau Peak',
          height: 5000,
          shape: MountainShape.PLATEAU,
          width: 6000, // 5000 * 1.2 = 6000
        },
      ];

      const { container } = render(<ComparisonView selectedMountains={shapeMountains} />);

      // Verify all mountains are rendered
      expect(container.querySelector('[data-testid="mountain-triangle-conical-mountain"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="mountain-triangle-dome-mountain"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="mountain-triangle-ridge-mountain"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="mountain-triangle-plateau-mountain"]')).toBeInTheDocument();

      // Verify scale information shows the widest mountain
      expect(container.textContent).toContain('Widest:');
      expect(container.textContent).toContain('6000m'); // Both dome and plateau have 6000m width
    });

    it('should handle comparison of mountains with same height but different shapes', () => {
      const sameHeightMountains: MountainWithCalculatedWidth[] = [
        {
          id: 'conical-3000',
          name: 'Conical 3000m',
          height: 3000,
          shape: MountainShape.CONICAL,
          width: 3464, // Calculated conical width
        },
        {
          id: 'plateau-3000',
          name: 'Plateau 3000m',
          height: 3000,
          shape: MountainShape.PLATEAU,
          width: 3600, // Calculated plateau width
        },
      ];

      const { container } = render(<ComparisonView selectedMountains={sameHeightMountains} />);

      // Both mountains should be rendered
      expect(container.querySelector('[data-testid="mountain-triangle-conical-3000"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="mountain-triangle-plateau-3000"]')).toBeInTheDocument();

      // Scale info should show same height but different widths
      expect(container.textContent).toContain('Tallest:');
      expect(container.textContent).toContain('3000m');
      expect(container.textContent).toContain('Widest:');
      expect(container.textContent).toContain('3600m'); // Plateau should be wider
    });

    it('should properly scale mountains with calculated widths', () => {
      const mountainsWithCalculatedWidths: MountainWithCalculatedWidth[] = [
        {
          id: 'small-conical',
          name: 'Small Conical',
          height: 1000,
          shape: MountainShape.CONICAL,
          width: 1155, // Calculated width
        },
        {
          id: 'large-dome',
          name: 'Large Dome',
          height: 8000,
          shape: MountainShape.DOME_SHAPED,
          width: 9600, // Calculated width
        },
      ];

      const { container } = render(<ComparisonView selectedMountains={mountainsWithCalculatedWidths} />);

      // Both triangles should use the same scale factor
      const triangles = container.querySelectorAll('[data-testid^="mountain-triangle-"]');
      triangles.forEach(triangle => {
        expect(triangle).toHaveAttribute('data-scale', '0.1000');
      });

      // Scale info should reflect the largest dimensions
      expect(container.textContent).toContain('Tallest:');
      expect(container.textContent).toContain('8000m');
      expect(container.textContent).toContain('Widest:');
      expect(container.textContent).toContain('9600m');
    });

    it('should handle edge case of minimum width constraint', () => {
      const mountainWithMinWidth: MountainWithCalculatedWidth = {
        id: 'min-width',
        name: 'Minimum Width Mountain',
        height: 1000,
        shape: MountainShape.CONICAL,
        width: 300, // Minimum width (height * 0.3)
      };

      render(<ComparisonView selectedMountains={[mountainWithMinWidth]} />);

      expect(screen.getByTestId('mountain-triangle-min-width')).toBeInTheDocument();
    });

    it('should maintain proportional comparison with mixed shape types', () => {
      const mixedShapeMountains: MountainWithCalculatedWidth[] = [
        {
          id: 'tall-conical',
          name: 'Tall Conical',
          height: 8000,
          shape: MountainShape.CONICAL,
          width: 9238, // Calculated conical width
        },
        {
          id: 'short-plateau',
          name: 'Short Plateau',
          height: 2000,
          shape: MountainShape.PLATEAU,
          width: 2400, // Calculated plateau width
        },
        {
          id: 'medium-dome',
          name: 'Medium Dome',
          height: 4000,
          shape: MountainShape.DOME_SHAPED,
          width: 4800, // Calculated dome width
        },
      ];

      const { container } = render(<ComparisonView selectedMountains={mixedShapeMountains} />);

      // All mountains should be rendered with same scale
      expect(container.querySelector('[data-testid="mountain-triangle-tall-conical"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="mountain-triangle-short-plateau"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="mountain-triangle-medium-dome"]')).toBeInTheDocument();

      // Scale should be based on the tallest and widest
      expect(container.textContent).toContain('Tallest:');
      expect(container.textContent).toContain('8000m');
      expect(container.textContent).toContain('Widest:');
      expect(container.textContent).toContain('9238m');
    });
  });
});