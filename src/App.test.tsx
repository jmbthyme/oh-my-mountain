/**
 * Integration tests for the main App component
 * Requirements: 5.1, 5.2, 5.4
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the useMountainData hook
const mockUseMountainData = vi.fn();
vi.mock('./hooks/useMountainData', () => ({
  useMountainData: () => mockUseMountainData()
}));

describe('App Component Integration Tests', () => {

  it('should display loading spinner when data is loading', () => {
    mockUseMountainData.mockReturnValue({
      mountains: [],
      loading: true,
      error: null,
      retry: vi.fn()
    });

    render(<App />);

    expect(screen.getByRole('status', { name: /loading mountain data/i })).toBeDefined();
    expect(screen.getByText('Loading Mountain Data...')).toBeDefined();
    expect(screen.getByText('Please wait while we fetch the mountain information.')).toBeDefined();
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
    expect(screen.getByText('Failed to load mountain data')).toBeDefined();
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
    expect(screen.getByRole('banner')).toBeDefined();
    expect(screen.getByText('Mountain Comparison')).toBeDefined();
    expect(screen.getByRole('main')).toBeDefined();
  });
});