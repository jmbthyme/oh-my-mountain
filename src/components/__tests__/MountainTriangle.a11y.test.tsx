import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { configureAxe } from 'jest-axe';

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
});
import MountainTriangle from '../MountainTriangle';
import { Mountain } from '../../types';

const mockMountain: Mountain = {
  id: 'everest',
  name: 'Mount Everest',
  height: 8849,
  width: 5000,
  country: 'Nepal/China',
  region: 'Himalayas'
};

const mockProps = {
  mountain: mockMountain,
  scale: 0.5,
  maxDimensions: {
    maxHeight: 9000,
    maxWidth: 6000
  }
};

describe('MountainTriangle Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(
      <MountainTriangle {...mockProps} />
    );

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('should have proper ARIA labels for SVG elements', () => {
    render(
      <MountainTriangle {...mockProps} />
    );

    // Check that SVG has proper accessibility attributes
    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-labelledby');
    
    // Check that container has proper accessibility attributes
    const container = screen.getByRole('button');
    expect(container).toHaveAttribute('aria-label');
  });

  it('should provide descriptive text for screen readers', () => {
    render(
      <MountainTriangle {...mockProps} />
    );

    // Check for descriptive text using testids to avoid multiple matches
    expect(screen.getByTestId('mountain-name')).toHaveTextContent('Mount Everest');
    expect(screen.getByTestId('mountain-height')).toHaveTextContent(/8849/i);
    expect(screen.getByTestId('mountain-width')).toHaveTextContent(/5000/i);
  });

  it('should have proper title and description elements', () => {
    render(
      <MountainTriangle {...mockProps} />
    );

    // Check for SVG title and description elements
    const svg = screen.getByRole('img');
    const title = svg.querySelector('title');
    const desc = svg.querySelector('desc');
    
    expect(title).toBeInTheDocument();
    expect(desc).toBeInTheDocument();
    expect(title).toHaveTextContent(/mount everest/i);
    expect(desc).toHaveTextContent(/triangle.*8849.*5000/i);
  });

  it('should support focus for keyboard users', () => {
    render(
      <MountainTriangle {...mockProps} />
    );

    // Check that the triangle container is focusable
    const container = screen.getByRole('button');
    expect(container).toHaveAttribute('tabIndex', '0');
  });

  it('should provide hover information accessibly', () => {
    render(
      <MountainTriangle {...mockProps} />
    );

    // Check that hover information is available to screen readers
    const container = screen.getByRole('button');
    expect(container).toHaveAttribute('aria-label');
    
    const ariaLabel = container.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/mount everest.*8849.*5000/i);
  });
});