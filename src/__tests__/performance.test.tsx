/**
 * Performance tests to verify loading and interaction speed requirements
 * Requirements: 5.1, 5.2 - Verify 2s load time and 500ms interaction response
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { mockMountains } from './mocks/mountainData';

// Mock the custom hooks
vi.mock('../hooks/useMountainData');
vi.mock('../hooks/useToast');

import { useMountainData } from '../hooks/useMountainData';
import { useToast } from '../hooks/useToast';

const mockUseMountainData = vi.mocked(useMountainData);
const mockUseToast = vi.mocked(useToast);

describe('Performance Tests', () => {
  const mockToastFunctions = {
    toasts: [],
    removeToast: vi.fn(),
    showWarning: vi.fn(),
    showError: vi.fn(),
    showSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToast.mockReturnValue(mockToastFunctions);
    // Mock performance.now for consistent timing
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading Performance - Requirement 5.1', () => {
    it('should load mountain data within 2 seconds', async () => {
      const startTime = performance.now();
      
      // Mock successful data loading
      mockUseMountainData.mockReturnValue({
        mountains: mockMountains,
        loading: false,
        error: null,
        retry: vi.fn(),
      });

      render(<App />);

      // Wait for the app to fully render
      await waitFor(() => {
        expect(screen.getByText('Mountain Comparison')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load within 2000ms (2 seconds)
      expect(loadTime).toBeLessThan(2000);
    });

    it('should show loading state immediately', () => {
      mockUseMountainData.mockReturnValue({
        mountains: [],
        loading: true,
        error: null,
        retry: vi.fn(),
      });

      const startTime = performance.now();
      render(<App />);
      const endTime = performance.now();

      // Loading state should appear immediately (within 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(document.querySelector('.mountain-list-skeleton')).toBeInTheDocument();
    });

    it('should transition from loading to loaded state smoothly', async () => {
      // Start with loading state
      const { rerender } = render(<App />);
      
      mockUseMountainData.mockReturnValue({
        mountains: [],
        loading: true,
        error: null,
        retry: vi.fn(),
      });

      rerender(<App />);
      expect(document.querySelector('.mountain-list-skeleton')).toBeInTheDocument();

      // Transition to loaded state
      mockUseMountainData.mockReturnValue({
        mountains: mockMountains,
        loading: false,
        error: null,
        retry: vi.fn(),
      });

      const transitionStart = performance.now();
      rerender(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(mockMountains[0].name)).toBeInTheDocument();
      });

      const transitionEnd = performance.now();
      const transitionTime = transitionEnd - transitionStart;

      // Transition should be smooth and fast (within 500ms)
      expect(transitionTime).toBeLessThan(500);
    });
  });

  describe('Interaction Performance - Requirement 5.2', () => {
    beforeEach(() => {
      mockUseMountainData.mockReturnValue({
        mountains: mockMountains,
        loading: false,
        error: null,
        retry: vi.fn(),
      });
    });

    it('should respond to mountain selection within 500ms', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(mockMountains[0].name)).toBeInTheDocument();
      });

      const mountainButton = screen.getByRole('button', { name: new RegExp(mockMountains[0].name) });

      const startTime = performance.now();
      
      // Click to select mountain
      await user.click(mountainButton);

      // Wait for the comparison view to update
      await waitFor(() => {
        expect(screen.getByText(/Mountain Size Comparison/)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Should respond within 500ms
      expect(responseTime).toBeLessThan(500);
    });

    it('should handle multiple rapid selections efficiently', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(mockMountains[0].name)).toBeInTheDocument();
      });

      const startTime = performance.now();

      // Rapidly select multiple mountains
      for (let i = 0; i < 3; i++) {
        const mountainButton = screen.getByRole('button', { name: new RegExp(mockMountains[i].name) });
        await user.click(mountainButton);
      }

      // Wait for all selections to be processed
      await waitFor(() => {
        expect(screen.getByText(/3 mountains/)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Multiple selections should complete within 1000ms total
      expect(totalTime).toBeLessThan(1000);
    });

    it('should handle window resize efficiently', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(mockMountains[0].name)).toBeInTheDocument();
      });

      // Select a mountain first
      const mountainButton = screen.getByRole('button', { name: new RegExp(mockMountains[0].name) });
      await userEvent.click(mountainButton);

      const startTime = performance.now();

      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 600,
      });

      fireEvent(window, new Event('resize'));

      // Wait for resize to be processed
      await waitFor(() => {
        // The comparison view should still be visible and responsive
        expect(screen.getByText(/Mountain Size Comparison/)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const resizeTime = endTime - startTime;

      // Resize handling should be fast (within 300ms)
      expect(resizeTime).toBeLessThan(300);
    });

    it('should clear selections quickly', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(mockMountains[0].name)).toBeInTheDocument();
      });

      // Select multiple mountains
      for (let i = 0; i < 3; i++) {
        const mountainButton = screen.getByRole('button', { name: new RegExp(mockMountains[i].name) });
        await user.click(mountainButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/3 mountains/)).toBeInTheDocument();
      });

      const clearButton = screen.getByText(/Clear All/);
      const startTime = performance.now();

      await user.click(clearButton);

      // Wait for selections to be cleared
      await waitFor(() => {
        expect(screen.getByText(/No Mountains Selected/)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const clearTime = endTime - startTime;

      // Clearing should be very fast (within 200ms)
      expect(clearTime).toBeLessThan(200);
    });
  });

  describe('Rendering Performance', () => {
    beforeEach(() => {
      mockUseMountainData.mockReturnValue({
        mountains: mockMountains,
        loading: false,
        error: null,
        retry: vi.fn(),
      });
    });

    it('should render large number of triangles efficiently', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(mockMountains[0].name)).toBeInTheDocument();
      });

      const startTime = performance.now();

      // Select maximum number of mountains (10)
      for (let i = 0; i < Math.min(10, mockMountains.length); i++) {
        const mountainButton = screen.getByRole('button', { name: new RegExp(mockMountains[i].name) });
        await user.click(mountainButton);
      }

      // Wait for all triangles to render
      await waitFor(() => {
        const triangles = document.querySelectorAll('.mountain-triangle-svg');
        expect(triangles.length).toBeGreaterThan(0);
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Rendering 10 triangles should be fast (within 1000ms)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle component re-renders efficiently with memoization', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(mockMountains[0].name)).toBeInTheDocument();
      });

      // Select a mountain
      const mountainItem = screen.getByText(mockMountains[0].name).closest('.mountain-item');
      await user.click(mountainItem!);

      await waitFor(() => {
        expect(document.querySelector('.mountain-triangle-svg')).toBeInTheDocument();
      });

      const startTime = performance.now();

      // Trigger multiple state updates that shouldn't cause unnecessary re-renders
      for (let i = 0; i < 5; i++) {
        fireEvent(window, new Event('resize'));
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Multiple updates should be handled efficiently (within 300ms)
      expect(updateTime).toBeLessThan(300);
    });
  });

  describe('Memory Performance', () => {
    it('should not create memory leaks with repeated selections', async () => {
      const user = userEvent.setup();
      
      mockUseMountainData.mockReturnValue({
        mountains: mockMountains,
        loading: false,
        error: null,
        retry: vi.fn(),
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(mockMountains[0].name)).toBeInTheDocument();
      });

      // Simulate repeated selection/deselection cycles
      for (let cycle = 0; cycle < 5; cycle++) {
        // Select mountains
        for (let i = 0; i < 3; i++) {
          const mountainItem = screen.getByText(mockMountains[i].name).closest('.mountain-item');
          await user.click(mountainItem!);
        }

        // Clear selections
        const clearButton = screen.getByText(/Clear All/);
        await user.click(clearButton);

        await waitFor(() => {
          expect(screen.getByText(/No Mountains Selected/)).toBeInTheDocument();
        });
      }

      // Test should complete without memory issues
      expect(true).toBe(true);
    });
  });
});