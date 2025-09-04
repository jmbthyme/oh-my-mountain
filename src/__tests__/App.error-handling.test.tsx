import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';

// Mock the mountain data hook to simulate different error scenarios
vi.mock('../hooks/useMountainData', () => ({
  useMountainData: vi.fn(),
}));

// Mock the toast hook
vi.mock('../hooks/useToast', () => ({
  useToast: vi.fn(() => ({
    toasts: [],
    removeToast: vi.fn(),
    showWarning: vi.fn(),
    showError: vi.fn(),
    showSuccess: vi.fn(),
  })),
}));

import { useMountainData } from '../hooks/useMountainData';
import { useToast } from '../hooks/useToast';

const mockUseMountainData = useMountainData as any;
const mockUseToast = useToast as any;

describe('App Error Handling', () => {
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
  });

  it('displays loading skeleton when data is loading', () => {
    mockUseMountainData.mockReturnValue({
      mountains: [],
      loading: true,
      error: null,
      retry: vi.fn(),
    });

    render(<App />);

    // Should show skeleton loaders instead of actual content
    expect(document.querySelector('.mountain-list-skeleton')).toBeInTheDocument();
    expect(document.querySelector('.comparison-view-skeleton')).toBeInTheDocument();
  });

  it('displays error state when data loading fails', () => {
    const mockRetry = vi.fn();
    mockUseMountainData.mockReturnValue({
      mountains: [],
      loading: false,
      error: 'Failed to fetch mountain data',
      retry: mockRetry,
    });

    render(<App />);

    expect(screen.getByText('Failed to Load Mountain Data')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch mountain data')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument();
  });

  it('calls retry function when Try Again is clicked', () => {
    const mockRetry = vi.fn();
    mockUseMountainData.mockReturnValue({
      mountains: [],
      loading: false,
      error: 'Network error',
      retry: mockRetry,
    });

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(mockRetry).toHaveBeenCalledOnce();
    expect(mockToastFunctions.showSuccess).toHaveBeenCalledWith(
      'Retrying...',
      'Attempting to reload mountain data'
    );
  });

  it('reloads page when Reload Page is clicked', () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    mockUseMountainData.mockReturnValue({
      mountains: [],
      loading: false,
      error: 'Critical error',
      retry: vi.fn(),
    });

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Reload Page' }));

    expect(mockReload).toHaveBeenCalledOnce();
  });

  it('shows error toast when data loading fails', () => {
    mockUseMountainData.mockReturnValue({
      mountains: [],
      loading: false,
      error: 'API error',
      retry: vi.fn(),
    });

    render(<App />);

    expect(mockToastFunctions.showError).toHaveBeenCalledWith(
      'Failed to load data',
      'API error'
    );
  });

  it('shows success state with mountain data', () => {
    const mockMountains = [
      {
        id: 'everest',
        name: 'Mount Everest',
        height: 8849,
        width: 5000,
        country: 'Nepal',
      },
    ];

    mockUseMountainData.mockReturnValue({
      mountains: mockMountains,
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(<App />);

    // Should show the main app interface
    expect(screen.getByText('Mountain Comparison')).toBeInTheDocument();
    expect(screen.getByText('Available Mountains')).toBeInTheDocument();
  });

  it('shows warning toast when selection limit is reached', async () => {
    const mockMountains = Array.from({ length: 15 }, (_, i) => ({
      id: `mountain-${i}`,
      name: `Mountain ${i}`,
      height: 1000 + i * 100,
      width: 500 + i * 50,
    }));

    mockUseMountainData.mockReturnValue({
      mountains: mockMountains,
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(<App />);

    // Select 10 mountains (the limit)
    const mountainItems = screen.getAllByRole('button', { name: /Mountain \d+/ });
    
    // Click first 10 mountains
    for (let i = 0; i < 10; i++) {
      fireEvent.click(mountainItems[i]);
    }

    // Try to select 11th mountain
    fireEvent.click(mountainItems[10]);

    expect(mockToastFunctions.showWarning).toHaveBeenCalledWith(
      'Selection limit reached',
      'You can compare up to 10 mountains at once. Remove some mountains to add new ones.'
    );
  });

  it('shows success toast when mountain is added', () => {
    const mockMountains = [
      {
        id: 'everest',
        name: 'Mount Everest',
        height: 8849,
        width: 5000,
      },
    ];

    mockUseMountainData.mockReturnValue({
      mountains: mockMountains,
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(<App />);

    const mountainButton = screen.getByRole('button', { name: /Mount Everest/ });
    fireEvent.click(mountainButton);

    expect(mockToastFunctions.showSuccess).toHaveBeenCalledWith(
      'Mountain added',
      'Mount Everest added to comparison'
    );
  });

  it('shows success toast when mountain is removed', () => {
    const mockMountains = [
      {
        id: 'everest',
        name: 'Mount Everest',
        height: 8849,
        width: 5000,
      },
    ];

    mockUseMountainData.mockReturnValue({
      mountains: mockMountains,
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(<App />);

    const mountainButton = screen.getByRole('button', { name: /Mount Everest/ });
    
    // Add mountain first
    fireEvent.click(mountainButton);
    
    // Remove mountain
    fireEvent.click(mountainButton);

    expect(mockToastFunctions.showSuccess).toHaveBeenCalledWith(
      'Mountain removed',
      'Mount Everest removed from comparison'
    );
  });

  it('shows success toast when all selections are cleared', () => {
    const mockMountains = [
      {
        id: 'everest',
        name: 'Mount Everest',
        height: 8849,
        width: 5000,
      },
    ];

    mockUseMountainData.mockReturnValue({
      mountains: mockMountains,
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(<App />);

    // Add a mountain first
    const mountainButton = screen.getByRole('button', { name: /Mount Everest/ });
    fireEvent.click(mountainButton);

    // Clear all selections
    const clearButton = screen.getByRole('button', { name: /Clear All/ });
    fireEvent.click(clearButton);

    // Confirm the clear action
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(mockToastFunctions.showSuccess).toHaveBeenCalledWith(
      'Selections cleared',
      'Removed 1 mountain from comparison'
    );
  });
});