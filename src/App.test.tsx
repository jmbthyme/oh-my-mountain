/**
 * Integration tests for the main App component
 * Requirements: 5.1, 5.2, 5.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { useMountainData } from './hooks/useMountainData';
import { useToast } from './hooks/useToast';

// Mock the useMountainData hook
vi.mock('./hooks/useMountainData');

// Mock the useToast hook
vi.mock('./hooks/useToast');

const mockUseMountainData = vi.mocked(useMountainData);
const mockUseToast = vi.mocked(useToast);

describe('App Component Integration Tests', () => {
  beforeEach(() => {
    // Mock toast functions
    mockUseToast.mockReturnValue({
      toasts: [],
      removeToast: vi.fn(),
      showWarning: vi.fn(),
      showError: vi.fn(),
      showSuccess: vi.fn(),
      addToast: vi.fn(),
      clearAllToasts: vi.fn(),
      showInfo: vi.fn(),
    });
  });

  it('should display skeleton loaders when data is loading', () => {
    mockUseMountainData.mockReturnValue({
      mountains: [],
      loading: true,
      error: null,
      retry: vi.fn()
    });

    render(<App />);

    // Should show skeleton loaders instead of old loading spinner
    const skeletonLoaders = screen.getAllByRole('status', { name: 'Loading content' });
    expect(skeletonLoaders.length).toBeGreaterThan(0);

    // Should show the header
    expect(screen.getByText('Mountain Comparison')).toBeDefined();
  });

  it('should display error message when data loading fails', () => {
    const mockRetry = vi.fn();
    mockUseMountainData.mockReturnValue({
      mountains: [],
      loading: false,
      error: 'Failed to load mountain data',
      retry: mockRetry
    });

    render(<App />);

    expect(screen.getByText('Failed to Load Mountain Data')).toBeDefined();
    // Use getAllByText since the error appears in both the main error display and toast
    const errorMessages = screen.getAllByText('Failed to load mountain data');
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('should render app structure when data loads successfully', () => {
    const mockMountainData = [
      {
        id: 'everest',
        name: 'Mount Everest',
        height: 8849,
        width: 5000,
        country: 'Nepal/China',
        region: 'Himalayas'
      }
    ];

    mockUseMountainData.mockReturnValue({
      mountains: mockMountainData,
      loading: false,
      error: null,
      retry: vi.fn()
    });

    render(<App />);

    // Check basic structure is rendered
    const headers = screen.getAllByRole('banner');
    expect(headers.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mountain Comparison').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('main').length).toBeGreaterThan(0);
    expect(screen.getByText('Available Mountains')).toBeDefined();
  });
});