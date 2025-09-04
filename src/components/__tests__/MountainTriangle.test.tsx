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

    // Use getAllByText since name appears in both title and text elements
    const nameElements = screen.getAllByText('Mount Everest');
    expect(nameElements.length).toBeGreaterThan(0);

    // Check specifically for the text label
    const nameLabel = document.querySelector('.mountain-name-label');
    expect(nameLabel).toHaveTextContent('Mount Everest');
  });

  it('displays mountain dimensions with proper formatting', () => {
    render(<MountainTriangle {...defaultProps} />);

    // Check height label specifically by class
    const heightLabel = document.querySelector('.height-label');
    expect(heightLabel).toHaveTextContent(/8[,]?849m/);

    // Check width label specifically by class
    const widthLabel = document.querySelector('.width-label');
    expect(widthLabel).toHaveTextContent(/W: 5[,]?000m/);
  });

  it('displays country information when available', () => {
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

    // Check that name is still displayed using class selector
    const nameLabel = document.querySelector('.mountain-name-label');
    expect(nameLabel).toHaveTextContent('Mount Everest');
  });

  it('has proper accessibility attributes', () => {
    render(<MountainTriangle {...defaultProps} />);

    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-labelledby');

    // Check for title element specifically
    const titleElement = document.querySelector('#title-everest');
    expect(titleElement).toHaveTextContent('Mount Everest');

    // Check for description
    expect(screen.getByText(/Mountain triangle showing Mount Everest/)).toBeInTheDocument();

    // Check for focusable triangle (tabIndex becomes tabindex in DOM)
    const trianglePath = document.querySelector('.mountain-triangle-path');
    expect(trianglePath).toHaveAttribute('tabindex', '0');
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
    const smallFontSize = smallNameLabel?.getAttribute('font-size');

    rerender(<MountainTriangle {...defaultProps} scale={largeScale} />);

    const largeNameLabel = document.querySelector('.mountain-name-label');
    const largeFontSize = largeNameLabel?.getAttribute('font-size');

    expect(Number(largeFontSize)).toBeGreaterThan(Number(smallFontSize));
  });

  it('positions labels correctly relative to triangle', () => {
    render(<MountainTriangle {...defaultProps} />);

    const nameLabel = document.querySelector('.mountain-name-label');
    const heightLabel = document.querySelector('.height-label');
    const widthLabel = document.querySelector('.width-label');

    // SVG attributes are rendered as kebab-case in DOM
    expect(nameLabel).toHaveAttribute('text-anchor', 'middle');
    expect(heightLabel).toHaveAttribute('text-anchor', 'middle');
    expect(widthLabel).toHaveAttribute('text-anchor', 'middle');

    // Name should be below triangle (higher Y value)
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