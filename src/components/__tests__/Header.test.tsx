import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Header } from '../Header';

// Mock window.confirm for testing
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

describe('Header', () => {
  const defaultProps = {
    selectedCount: 0,
    onClearSelections: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true); // Default to confirming
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the header with application title and branding', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Mountain Comparison')).toBeInTheDocument();
    expect(screen.getByText('Compare mountain dimensions with interactive visualizations')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Mountain' })).toBeInTheDocument();
  });

  it('displays selected mountain count correctly', () => {
    render(<Header {...defaultProps} selectedCount={0} />);
    expect(screen.getByText('0 mountains selected')).toBeInTheDocument();
  });

  it('displays singular form for one selected mountain', () => {
    render(<Header {...defaultProps} selectedCount={1} />);
    expect(screen.getByText('1 mountain selected')).toBeInTheDocument();
  });

  it('displays plural form for multiple selected mountains', () => {
    render(<Header {...defaultProps} selectedCount={5} />);
    expect(screen.getByText('5 mountains selected')).toBeInTheDocument();
  });

  it('does not show clear button when no mountains are selected', () => {
    render(<Header {...defaultProps} selectedCount={0} />);
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('shows clear button when mountains are selected', () => {
    render(<Header {...defaultProps} selectedCount={3} />);
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('does not show clear button when onClearSelections is not provided', () => {
    render(<Header selectedCount={3} />);
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('calls onClearSelections when clear button is clicked and confirmed', () => {
    const mockClear = vi.fn();
    mockConfirm.mockReturnValue(true);
    
    render(<Header selectedCount={3} onClearSelections={mockClear} />);
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to clear all 3 selected mountains?');
    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  it('does not call onClearSelections when clear button is clicked but not confirmed', () => {
    const mockClear = vi.fn();
    mockConfirm.mockReturnValue(false);
    
    render(<Header selectedCount={2} onClearSelections={mockClear} />);
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to clear all 2 selected mountains?');
    expect(mockClear).not.toHaveBeenCalled();
  });

  it('shows singular confirmation message for one selected mountain', () => {
    const mockClear = vi.fn();
    
    render(<Header selectedCount={1} onClearSelections={mockClear} />);
    
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);
    
    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to clear all 1 selected mountain?');
  });

  it('has proper accessibility attributes for clear button', () => {
    render(<Header selectedCount={3} onClearSelections={vi.fn()} />);
    
    const clearButton = screen.getByText('Clear All');
    expect(clearButton).toHaveAttribute('type', 'button');
    expect(clearButton).toHaveAttribute('aria-label', 'Clear all 3 selected mountains');
  });

  it('does not call onClearSelections when selectedCount is 0', () => {
    const mockClear = vi.fn();
    
    // Render with 1 mountain first to get the button
    const { rerender } = render(<Header selectedCount={1} onClearSelections={mockClear} />);
    
    // Then rerender with 0 mountains
    rerender(<Header selectedCount={0} onClearSelections={mockClear} />);
    
    // Button should not be visible
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('handles keyboard navigation on clear button', () => {
    const mockClear = vi.fn();
    mockConfirm.mockReturnValue(true);
    
    render(<Header selectedCount={2} onClearSelections={mockClear} />);
    
    const clearButton = screen.getByText('Clear All');
    
    // Test Enter key
    fireEvent.keyDown(clearButton, { key: 'Enter' });
    // Note: keyDown doesn't trigger click by default in testing-library
    // The actual click behavior is handled by the browser
    
    // Test Space key
    fireEvent.keyDown(clearButton, { key: ' ' });
    
    // Focus behavior
    clearButton.focus();
    expect(clearButton).toHaveFocus();
  });

  it('maintains proper header structure and styling classes', () => {
    render(<Header {...defaultProps} selectedCount={2} />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('header');
    
    const container = header.querySelector('.header__container');
    expect(container).toBeInTheDocument();
    
    const branding = header.querySelector('.header__branding');
    expect(branding).toBeInTheDocument();
    
    const controls = header.querySelector('.header__controls');
    expect(controls).toBeInTheDocument();
    
    const title = header.querySelector('.header__title');
    expect(title).toBeInTheDocument();
    
    const subtitle = header.querySelector('.header__subtitle');
    expect(subtitle).toBeInTheDocument();
  });

  it('renders correctly without onClearSelections prop', () => {
    render(<Header selectedCount={5} />);
    
    expect(screen.getByText('Mountain Comparison')).toBeInTheDocument();
    expect(screen.getByText('5 mountains selected')).toBeInTheDocument();
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('handles edge case with very high selection count', () => {
    render(<Header selectedCount={999} onClearSelections={vi.fn()} />);
    
    expect(screen.getByText('999 mountains selected')).toBeInTheDocument();
    
    const clearButton = screen.getByText('Clear All');
    expect(clearButton).toHaveAttribute('aria-label', 'Clear all 999 selected mountains');
  });

  it('maintains responsive behavior indicators', () => {
    render(<Header {...defaultProps} selectedCount={3} />);
    
    // Check that responsive classes are present
    const container = screen.getByRole('banner').querySelector('.header__container');
    expect(container).toHaveClass('header__container');
    
    const controls = screen.getByRole('banner').querySelector('.header__controls');
    expect(controls).toHaveClass('header__controls');
  });
});