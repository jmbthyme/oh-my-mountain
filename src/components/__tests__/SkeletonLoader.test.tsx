import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonLoader, MountainListSkeleton, ComparisonViewSkeleton } from '../SkeletonLoader';

describe('SkeletonLoader', () => {
  it('renders with default props', () => {
    render(<SkeletonLoader />);
    
    const skeleton = screen.getByRole('status', { name: 'Loading content' });
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('skeleton--text');
    expect(skeleton).toHaveClass('skeleton--animate');
  });

  it('renders different variants', () => {
    const variants = ['text', 'rectangular', 'circular'] as const;
    
    variants.forEach((variant) => {
      const { unmount } = render(<SkeletonLoader variant={variant} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass(`skeleton--${variant}`);
      unmount();
    });
  });

  it('applies custom dimensions', () => {
    render(<SkeletonLoader width="200px" height="50px" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '50px',
    });
  });

  it('applies numeric dimensions', () => {
    render(<SkeletonLoader width={150} height={30} />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({
      width: '150px',
      height: '30px',
    });
  });

  it('can disable animation', () => {
    render(<SkeletonLoader animate={false} />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).not.toHaveClass('skeleton--animate');
  });

  it('applies custom className', () => {
    render(<SkeletonLoader className="custom-skeleton" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('custom-skeleton');
  });
});

describe('MountainListSkeleton', () => {
  it('renders mountain list skeleton structure', () => {
    render(<MountainListSkeleton />);
    
    // Should render multiple skeleton items
    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBeGreaterThan(5); // Header + multiple items
    
    // Check for container structure
    const container = document.querySelector('.mountain-list-skeleton');
    expect(container).toBeInTheDocument();
    
    const header = document.querySelector('.mountain-list-skeleton__header');
    expect(header).toBeInTheDocument();
    
    const items = document.querySelector('.mountain-list-skeleton__items');
    expect(items).toBeInTheDocument();
  });
});

describe('ComparisonViewSkeleton', () => {
  it('renders comparison view skeleton structure', () => {
    render(<ComparisonViewSkeleton />);
    
    // Should render multiple skeleton items
    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBeGreaterThan(5); // Header + multiple grid items
    
    // Check for container structure
    const container = document.querySelector('.comparison-view-skeleton');
    expect(container).toBeInTheDocument();
    
    const header = document.querySelector('.comparison-view-skeleton__header');
    expect(header).toBeInTheDocument();
    
    const grid = document.querySelector('.comparison-view-skeleton__grid');
    expect(grid).toBeInTheDocument();
  });
});