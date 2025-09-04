import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status', { name: 'Loading' });
    expect(spinner).toBeInTheDocument();
    expect(spinner.parentElement).toHaveClass('loading-spinner--medium');
  });

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Loading mountains..." />);
    
    expect(screen.getByRole('status', { name: 'Loading mountains...' })).toBeInTheDocument();
    expect(screen.getByText('Loading mountains...')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    
    sizes.forEach((size) => {
      const { unmount } = render(<LoadingSpinner size={size} />);
      const container = screen.getByRole('status').parentElement?.parentElement;
      expect(container).toHaveClass(`loading-spinner--${size}`);
      unmount();
    });
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const container = screen.getByRole('status').parentElement?.parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner message="Loading data" />);
    
    const spinner = screen.getByRole('status', { name: 'Loading data' });
    expect(spinner).toBeInTheDocument();
    
    const message = screen.getByText('Loading data');
    expect(message).toHaveAttribute('aria-live', 'polite');
  });

  it('renders without message when not provided', () => {
    render(<LoadingSpinner />);
    
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});