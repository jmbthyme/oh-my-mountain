import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MountainTriangle from '../MountainTriangle';
import type { Mountain } from '../../types';

// Mock the scaling utilities
vi.mock('../../utils', () => ({
  generateTrianglePath: vi.fn((mountain, scale) => 
    `M ${mountain.width * scale / 2} 0 L 0 ${mountain.height * scale} L ${mountain.width * scale} ${mountain.height * scale} Z`
  ),
  calculateScaledDimensions: vi.fn((mountain, scale) => ({
    scaledWidth: mountain.width * scale,
    scaledHeight: mountain.height * scale,
  })),
}));

describe('MountainTriangle', () => {
  const mockMountain: Mountain = {
    id: 'everest',
    name: 'Mount Everest',
    height: 8849,
    width: 5000,
    country: 'Nepal/China',
    region: 'Himalayas',
  };

  const defaultProps = {
    mountain: mockMountain,
    scale: 0.01,
    maxDimensions: { height: 8849, width: 5000 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders mountain triangle with correct structure', () => {
    render(<MountainTriangle {...defaultProps} />);
    
    // Check for SVG element
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    
    // Check for triangle path
    const trianglePath = document.querySelector('.mountain-triangle-path');
    expect(trianglePath).toBeInTheDocument();
  });

  it('displays mountain name correctly', () => {
    render(<MountainTriangle {...defaultProps} />);
    
    expect(screen.getByText('Mount Everest')).toBeInTheDocument();
  });

  it('displays mountain dimensions with proper formatting', () => {
    render(<MountainTriangle {...defaultProps} />);
    
    // Height should be displayed with locale formatting
    expect(screen.getByText('8,849m')).toBeInTheDocument();
    
    // Width should be displayed with W: prefix
    expect(screen.getByText('W: 5,000m')).toBeInTheDocument();
  });  it(
'displays country information when available', () => {
    render(<MountainTriangle {...defaultProps} />);
    
    expect(screen.getByText('Nepal/China')).toBeInTheDocument();
  });

  it('handles mountain without country gracefully', () => {
    const mountainWithoutCountry: Mountain = {
      ...mockMountain,
      country: undefined,
    };
    
    render(<MountainTriangle {...defaultProps} mountain={mountainWithoutCountry} />);
    
    expect(screen.queryByText('Nepal/China')).not.toBeInTheDocument();
    expect(screen.getByText('Mount Everest')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<MountainTriangle {...defaultProps} />);
    
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-labelledby');
    
    // Check for title and description elements
    expect(screen.getByText('Mount Everest')).toBeInTheDocument();
    expect(screen.getByText(/Mountain triangle showing Mount Everest/)).toBeInTheDocument();
    
    // Check for focusable triangle
    const trianglePath = document.querySelector('.mountain-triangle-path');
    expect(trianglePath).toHaveAttribute('tabIndex', '0');
    expect(trianglePath).toHaveAttribute('role', 'button');
  });

  it('generates consistent colors for same mountain ID', () => {
    const { rerender } = render(<MountainTriangle {...defaultProps} />);
    
    const firstTriangle = document.querySelector('.mountain-triangle-path');
    const firstColor = firstTriangle?.getAttribute('fill');
    
    // Re-render with same mountain
    rerender(<MountainTriangle {...defaultProps} />);
    
    const secondTriangle = document.querySelector('.mountain-triangle-path');
    const secondColor = secondTriangle?.getAttribute('fill');
    
    expect(firstColor).toBe(secondColor);
  });

  it('generates different colors for different mountain IDs', () => {
    const { rerender } = render(<MountainTriangle {...defaultProps} />);
    
    const firstTriangle = document.querySelector('.mountain-triangle-path');
    const firstColor = firstTriangle?.getAttribute('fill');
    
    // Re-render with different mountain
    const differentMountain: Mountain = {
      ...mockMountain,
      id: 'k2',
      name: 'K2',
    };
    
    rerender(<MountainTriangle {...defaultProps} mountain={differentMountain} />);
    
    const secondTriangle = document.querySelector('.mountain-triangle-path');
    const secondColor = secondTriangle?.getAttribute('fill');
    
    expect(firstColor).not.toBe(secondColor);
  });

  it('calculates responsive text sizes based on scaled width', () => {
    const smallScale = 0.005;
    const largeScale = 0.02;
    
    const { rerender } = render(<MountainTriangle {...defaultProps} scale={smallScale} />);
    
    const smallNameLabel = document.querySelector('.mountain-name-label');
    const smallFontSize = smallNameLabel?.getAttribute('fontSize');
    
    rerender(<MountainTriangle {...defaultProps} scale={largeScale} />);
    
    const largeNameLabel = document.querySelector('.mountain-name-label');
    const largeFontSize = largeNameLabel?.getAttribute('fontSize');
    
    expect(Number(largeFontSize)).toBeGreaterThan(Number(smallFontSize));
  });

  it('positions labels correctly relative to triangle', () => {
    render(<MountainTriangle {...defaultProps} />);
    
    const nameLabel = document.querySelector('.mountain-name-label');
    const heightLabel = document.querySelector('.height-label');
    const widthLabel = document.querySelector('.width-label');
    
    expect(nameLabel).toHaveAttribute('textAnchor', 'middle');
    expect(heightLabel).toHaveAttribute('textAnchor', 'middle');
    expect(widthLabel).toHaveAttribute('textAnchor', 'middle');
    
    // Name should be below triangle
    const nameY = Number(nameLabel?.getAttribute('y'));
    const heightY = Number(heightLabel?.getAttribute('y'));
    expect(nameY).toBeGreaterThan(heightY);
  });

  it('applies proper CSS classes for styling', () => {
    render(<MountainTriangle {...defaultProps} />);
    
    expect(document.querySelector('.mountain-triangle-container')).toBeInTheDocument();
    expect(document.querySelector('.mountain-triangle-svg')).toBeInTheDocument();
    expect(document.querySelector('.mountain-triangle-path')).toBeInTheDocument();
    expect(document.querySelector('.mountain-name-label')).toBeInTheDocument();
    expect(document.querySelector('.height-label')).toBeInTheDocument();
    expect(document.querySelector('.width-label')).toBeInTheDocument();
  });
});