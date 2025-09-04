import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ComparisonView from '../ComparisonView';
import type { Mountain } from '../../types';

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
  calculateMaxDimensions: vi.fn((mountains: Mountain[]) => ({
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
  const mockMountains: Mountain[] = [
    {
      id: 'everest',
      name: 'Mount Everest',
      height: 8849,
      width: 5000,
      country: 'Nepal/China',
      region: 'Himalayas',
    },
    {
      id: 'k2',
      name: 'K2',
      height: 8611,
      width: 4200,
      country: 'Pakistan/China',
      region: 'Karakoram',
    },
    {
      id: 'kangchenjunga',
      name: 'Kangchenjunga',
      height: 8586,
      width: 4500,
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

    it('should render scale information', () => {
      const { container } = render(<ComparisonView selectedMountains={mockMountains} />);

      expect(container.textContent).toContain('Tallest:');
      expect(container.textContent).toContain('8849m');
      expect(container.textContent).toContain('Widest:');
      expect(container.textContent).toContain('5000m');
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
      const mountainWithZero: Mountain = {
        id: 'zero',
        name: 'Zero Mountain',
        height: 0,
        width: 0,
      };

      render(<ComparisonView selectedMountains={[mountainWithZero]} />);

      expect(screen.getByTestId('mountain-triangle-zero')).toBeInTheDocument();
    });

    it('should handle mountains with very large dimensions', () => {
      const largeMountain: Mountain = {
        id: 'large',
        name: 'Large Mountain',
        height: 999999,
        width: 999999,
      };

      render(<ComparisonView selectedMountains={[largeMountain]} />);

      expect(screen.getByTestId('mountain-triangle-large')).toBeInTheDocument();
    });

    it('should handle missing optional mountain properties', () => {
      const minimalMountain: Mountain = {
        id: 'minimal',
        name: 'Minimal Mountain',
        height: 1000,
        width: 500,
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
});