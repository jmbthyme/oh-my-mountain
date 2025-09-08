import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the mountain data
const mockMountainData = {
  mountains: [
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
      width: 4500,
      country: 'Nepal/India',
      region: 'Himalayas'
    }
  ]
};

// Mock fetch for mountain data
global.fetch = vi.fn();

describe('End-to-End Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockMountainData
    });
  });

  describe('Complete User Journey: Mountain Selection and Comparison', () => {
    it('should complete the full user workflow from loading to comparison', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 1. Wait for application to load
      await waitFor(() => {
        expect(screen.getByTestId('mountain-list')).toBeInTheDocument();
      });

      // 2. Verify mountains are displayed
      expect(screen.getByTestId('mountain-item-everest')).toBeInTheDocument();
      expect(screen.getByTestId('mountain-item-k2')).toBeInTheDocument();
      expect(screen.getByTestId('mountain-item-kangchenjunga')).toBeInTheDocument();

      // 3. Select first mountain
      await user.click(screen.getByTestId('mountain-item-everest'));

      // 4. Verify mountain is selected and triangle appears
      await waitFor(() => {
        expect(screen.getByTestId('triangle-everest')).toBeInTheDocument();
      });

      const everestCheckbox = screen.getByTestId('mountain-item-everest').querySelector('input[type="checkbox"]');
      expect(everestCheckbox).toBeChecked();

      // 5. Select second mountain
      await user.click(screen.getByTestId('mountain-item-k2'));

      // 6. Verify both triangles are visible
      await waitFor(() => {
        expect(screen.getByTestId('triangle-everest')).toBeInTheDocument();
        expect(screen.getByTestId('triangle-k2')).toBeInTheDocument();
      });

      // 7. Verify header shows correct count
      expect(screen.getByTestId('selected-count')).toHaveTextContent('2');

      // 8. Deselect first mountain
      await user.click(screen.getByTestId('mountain-item-everest'));

      // 9. Verify only K2 triangle remains
      await waitFor(() => {
        expect(screen.queryByTestId('triangle-everest')).not.toBeInTheDocument();
        expect(screen.getByTestId('triangle-k2')).toBeInTheDocument();
      });

      // 10. Clear all selections
      await user.click(screen.getByTestId('clear-all-button'));

      // 11. Verify empty state is shown
      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.queryByTestId('triangle-k2')).not.toBeInTheDocument();
      });

      // 12. Verify header shows zero count
      expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
    });

    it('should handle maximum selection limit correctly', async () => {
      const user = userEvent.setup();
      
      // Mock data with more mountains to test limit
      const extendedMountainData = {
        mountains: Array.from({ length: 12 }, (_, i) => ({
          id: `mountain-${i}`,
          name: `Mountain ${i}`,
          height: 8000 + i * 10,
          width: 4000 + i * 100,
          country: 'Test Country',
          region: 'Test Region'
        }))
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => extendedMountainData
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('mountain-list')).toBeInTheDocument();
      });

      // Select 10 mountains (the maximum)
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByTestId(`mountain-item-mountain-${i}`));
      }

      // Verify 10 mountains are selected
      expect(screen.getByTestId('selected-count')).toHaveTextContent('10');

      // Try to select 11th mountain
      await user.click(screen.getByTestId('mountain-item-mountain-10'));

      // Verify toast warning appears
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
        expect(screen.getByTestId('toast')).toHaveTextContent(/maximum/i);
      });

      // Verify 11th mountain is not selected
      const eleventhCheckbox = screen.getByTestId('mountain-item-mountain-10').querySelector('input[type="checkbox"]');
      expect(eleventhCheckbox).not.toBeChecked();

      // Verify count is still 10
      expect(screen.getByTestId('selected-count')).toHaveTextContent('10');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      // Mock fetch to fail
      (fetch as any).mockRejectedValue(new Error('Network error'));

      render(<App />);

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByTestId('error-message')).toHaveTextContent(/failed to load/i);
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('should retry loading after error', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to fail first, then succeed
      (fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMountainData
        });

      render(<App />);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      // Click retry button
      await user.click(screen.getByTestId('retry-button'));

      // Wait for successful load
      await waitFor(() => {
        expect(screen.getByTestId('mountain-list')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should handle invalid JSON data', async () => {
      // Mock fetch to return invalid data
      (fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'data' })
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      expect(screen.getByTestId('error-message')).toHaveTextContent(/invalid.*data/i);
    });
  });

  describe('Responsive Behavior Integration', () => {
    it('should maintain functionality when window is resized', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('mountain-list')).toBeInTheDocument();
      });

      // Select a mountain
      await user.click(screen.getByTestId('mountain-item-everest'));

      await waitFor(() => {
        expect(screen.getByTestId('triangle-everest')).toBeInTheDocument();
      });

      // Simulate window resize
      global.innerWidth = 375;
      global.innerHeight = 667;
      fireEvent(window, new Event('resize'));

      // Wait for resize to be processed
      await waitFor(() => {
        // Triangle should still be visible after resize
        expect(screen.getByTestId('triangle-everest')).toBeInTheDocument();
      });

      // Functionality should still work
      await user.click(screen.getByTestId('mountain-item-k2'));

      await waitFor(() => {
        expect(screen.getByTestId('triangle-k2')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Integration', () => {
    it('should handle multiple rapid selections efficiently', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('mountain-list')).toBeInTheDocument();
      });

      const startTime = performance.now();

      // Rapidly select and deselect mountains
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByTestId('mountain-item-everest'));
        await user.click(screen.getByTestId('mountain-item-k2'));
        await user.click(screen.getByTestId('mountain-item-kangchenjunga'));
        await user.click(screen.getByTestId('clear-all-button'));
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time (5 seconds for 20 operations)
      expect(totalTime).toBeLessThan(5000);

      // Final state should be empty
      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should support keyboard navigation throughout the application', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('mountain-list')).toBeInTheDocument();
      });

      // Tab to first mountain
      fireEvent.keyDown(document.body, { key: 'Tab' });
      
      const firstCheckbox = screen.getByTestId('mountain-item-everest').querySelector('input[type="checkbox"]');
      expect(firstCheckbox).toHaveFocus();

      // Select with space key
      fireEvent.keyDown(firstCheckbox!, { key: ' ' });
      
      await waitFor(() => {
        expect(screen.getByTestId('triangle-everest')).toBeInTheDocument();
      });

      // Tab to next mountain
      fireEvent.keyDown(firstCheckbox!, { key: 'Tab' });
      
      const secondCheckbox = screen.getByTestId('mountain-item-k2').querySelector('input[type="checkbox"]');
      expect(secondCheckbox).toHaveFocus();

      // Select with Enter key
      fireEvent.keyDown(secondCheckbox!, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByTestId('triangle-k2')).toBeInTheDocument();
      });
    });
  });
});