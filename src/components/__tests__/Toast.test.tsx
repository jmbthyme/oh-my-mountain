import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { Toast } from '../Toast';

describe('Toast', () => {
  const defaultProps = {
    id: 'test-toast',
    type: 'info' as const,
    title: 'Test Title',
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders toast with title', () => {
    render(<Toast {...defaultProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders toast with message when provided', () => {
    render(<Toast {...defaultProps} message="Test message" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders correct icon for each toast type', () => {
    const types = [
      { type: 'success' as const, icon: '✅' },
      { type: 'error' as const, icon: '❌' },
      { type: 'warning' as const, icon: '⚠️' },
      { type: 'info' as const, icon: 'ℹ️' },
    ];

    types.forEach(({ type, icon }) => {
      const { unmount } = render(<Toast {...defaultProps} type={type} />);
      expect(screen.getByText(icon)).toBeInTheDocument();
      unmount();
    });
  });

  it('applies correct CSS class for toast type', () => {
    render(<Toast {...defaultProps} type="success" />);
    
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('toast--success');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Toast {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Close notification' }));
    
    expect(onClose).toHaveBeenCalledWith('test-toast');
  });

  it('auto-dismisses after specified duration', async () => {
    const onClose = vi.fn();
    render(<Toast {...defaultProps} onClose={onClose} duration={100} />);
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith('test-toast');
    }, { timeout: 500 });
  });

  it('shows entrance animation', async () => {
    render(<Toast {...defaultProps} />);
    
    const toast = screen.getByRole('alert');
    
    // Initially not visible
    expect(toast).not.toHaveClass('toast--visible');
    
    // Should become visible after animation delay
    await waitFor(() => {
      expect(toast).toHaveClass('toast--visible');
    });
  });

  it('has proper accessibility attributes', () => {
    render(<Toast {...defaultProps} type="error" />);
    
    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    
    const icon = screen.getByRole('img', { name: 'error notification' });
    expect(icon).toBeInTheDocument();
    
    const closeButton = screen.getByRole('button', { name: 'Close notification' });
    expect(closeButton).toBeInTheDocument();
  });
});