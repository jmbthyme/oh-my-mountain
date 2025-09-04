import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ToastContainer } from '../ToastContainer';
import type { ToastData } from '../ToastContainer';

describe('ToastContainer', () => {
  const mockOnRemoveToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when no toasts are provided', () => {
    const { container } = render(
      <ToastContainer toasts={[]} onRemoveToast={mockOnRemoveToast} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders multiple toasts', () => {
    const toasts: ToastData[] = [
      {
        id: 'toast-1',
        type: 'success',
        title: 'Success Toast',
        message: 'Success message',
      },
      {
        id: 'toast-2',
        type: 'error',
        title: 'Error Toast',
        message: 'Error message',
      },
    ];

    render(<ToastContainer toasts={toasts} onRemoveToast={mockOnRemoveToast} />);
    
    expect(screen.getByText('Success Toast')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error Toast')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const toasts: ToastData[] = [
      {
        id: 'toast-1',
        type: 'info',
        title: 'Info Toast',
      },
    ];

    render(<ToastContainer toasts={toasts} onRemoveToast={mockOnRemoveToast} />);
    
    const container = screen.getByLabelText('Notifications');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });

  it('passes correct props to Toast components', () => {
    const toasts: ToastData[] = [
      {
        id: 'toast-1',
        type: 'warning',
        title: 'Warning Toast',
        message: 'Warning message',
        duration: 3000,
      },
    ];

    render(<ToastContainer toasts={toasts} onRemoveToast={mockOnRemoveToast} />);
    
    // Verify the toast is rendered with correct content
    expect(screen.getByText('Warning Toast')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument(); // Warning icon
  });
});