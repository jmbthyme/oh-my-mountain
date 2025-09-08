import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { configureAxe } from 'jest-axe';

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
});
import { MountainList } from '../MountainList';
import { Mountain } from '../../types';

const mockMountains: Mountain[] = [
  {
    id: 'everest',
    name: 'Mount Everest',
    height: 8849,
    width: 5000,
    country: 'Nepal/China',
    region: 'Himalayas'
  },
  {
    id: 'k2',
    name: 'K2',
    height: 8611,
    width: 4200,
    country: 'Pakistan/China',
    region: 'Karakoram'
  }
];

describe('MountainList Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const mockOnToggle = vi.fn();
    
    const { container } = render(
      <MountainList
        mountains={mockMountains}
        selectedMountains={[]}
        onMountainToggle={mockOnToggle}
      />
    );

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('should have proper ARIA labels for mountain items', () => {
    const mockOnToggle = vi.fn();
    
    render(
      <MountainList
        mountains={mockMountains}
        selectedMountains={[]}
        onMountainToggle={mockOnToggle}
      />
    );

    // Check that each mountain item has proper labeling
    const everestItem = screen.getByRole('checkbox', { name: /mount everest/i });
    expect(everestItem).toHaveAttribute('aria-describedby');
    
    const k2Item = screen.getByRole('checkbox', { name: /k2/i });
    expect(k2Item).toHaveAttribute('aria-describedby');
  });

  it('should have proper heading structure', () => {
    const mockOnToggle = vi.fn();
    
    render(
      <MountainList
        mountains={mockMountains}
        selectedMountains={[]}
        onMountainToggle={mockOnToggle}
      />
    );

    // Check for proper heading
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/available mountains/i);
  });

  it('should support keyboard navigation', () => {
    const mockOnToggle = vi.fn();
    
    render(
      <MountainList
        mountains={mockMountains}
        selectedMountains={[]}
        onMountainToggle={mockOnToggle}
      />
    );

    // Check that checkboxes are focusable
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAttribute('tabIndex', '0');
    });
  });

  it('should announce selection state changes', () => {
    const mockOnToggle = vi.fn();
    
    render(
      <MountainList
        mountains={mockMountains}
        selectedMountains={[mockMountains[0]]}
        onMountainToggle={mockOnToggle}
      />
    );

    // Check that selected mountain has proper aria-checked state
    const selectedCheckbox = screen.getByRole('checkbox', { name: /mount everest/i });
    expect(selectedCheckbox).toHaveAttribute('aria-checked', 'true');
    
    // Check that unselected mountain has proper aria-checked state
    const unselectedCheckbox = screen.getByRole('checkbox', { name: /k2/i });
    expect(unselectedCheckbox).toHaveAttribute('aria-checked', 'false');
  });

  it('should properly handle disabled state for keyboard navigation', () => {
    const mockOnToggle = vi.fn();
    
    // Create scenario with max selections to test disabled state
    const elevenMountains = Array.from({ length: 11 }, (_, i) => ({
      id: `mountain-${i}`,
      name: `Mountain ${i}`,
      height: 8000 + i,
      width: 4000 + i
    }));
    
    const tenSelected = elevenMountains.slice(0, 10);
    
    render(
      <MountainList
        mountains={elevenMountains}
        selectedMountains={tenSelected}
        onMountainToggle={mockOnToggle}
      />
    );

    // Find the disabled checkbox (11th mountain)
    const disabledCheckbox = screen.getAllByRole('checkbox').find(checkbox => 
      checkbox.getAttribute('aria-labelledby')?.includes('mountain-10')
    );
    
    expect(disabledCheckbox).toBeDefined();
    expect(disabledCheckbox).toHaveAttribute('aria-disabled', 'true');
    expect(disabledCheckbox).toHaveAttribute('tabIndex', '-1');
  });

  it('should have proper checkbox structure', () => {
    const mockOnToggle = vi.fn();
    
    render(
      <MountainList
        mountains={mockMountains}
        selectedMountains={[]}
        onMountainToggle={mockOnToggle}
      />
    );

    // Check for proper checkbox structure
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(mockMountains.length);
    
    // Each checkbox should have proper labeling
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAttribute('aria-labelledby');
      expect(checkbox).toHaveAttribute('aria-describedby');
    });
  });
});