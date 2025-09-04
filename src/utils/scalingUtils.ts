/**
 * Scaling utilities for mountain triangle visualization
 * Requirements: 3.2, 3.3, 5.3
 */

import type { Mountain, ScaleConfig } from '../types';

/**
 * Calculate the maximum dimensions from a collection of mountains
 * @param mountains Array of mountains to analyze
 * @returns Object containing maximum height and width
 */
export const calculateMaxDimensions = (mountains: Mountain[]): { maxHeight: number; maxWidth: number } => {
  if (mountains.length === 0) {
    return { maxHeight: 0, maxWidth: 0 };
  }

  const maxHeight = Math.max(...mountains.map(mountain => mountain.height));
  const maxWidth = Math.max(...mountains.map(mountain => mountain.width));

  return { maxHeight, maxWidth };
};

/**
 * Calculate responsive container dimensions based on viewport and padding
 * @param viewportWidth Current viewport width
 * @param viewportHeight Current viewport height
 * @param padding Padding to subtract from container dimensions
 * @returns Container dimensions for triangle rendering
 */
export const calculateContainerDimensions = (
  viewportWidth: number,
  viewportHeight: number,
  padding: number = 40
): { containerWidth: number; containerHeight: number } => {
  // Responsive reserved space based on screen size
  let reservedHeight: number;
  let reservedWidth: number;

  if (viewportWidth <= 480) {
    // Mobile phones
    reservedHeight = 180;
    reservedWidth = 40;
    padding = Math.min(padding, 20);
  } else if (viewportWidth <= 768) {
    // Tablets and small screens
    reservedHeight = 200;
    reservedWidth = 60;
    padding = Math.min(padding, 30);
  } else if (viewportWidth <= 1024) {
    // Small desktops
    reservedHeight = 220;
    reservedWidth = 200;
  } else {
    // Large desktops
    reservedHeight = 240;
    reservedWidth = 300;
  }

  // Calculate container dimensions with responsive minimums
  const minWidth = viewportWidth <= 480 ? 280 : viewportWidth <= 768 ? 400 : 500;
  const minHeight = viewportWidth <= 480 ? 200 : viewportWidth <= 768 ? 250 : 300;

  const containerWidth = Math.max(minWidth, viewportWidth - reservedWidth - padding * 2);
  const containerHeight = Math.max(minHeight, viewportHeight - reservedHeight - padding * 2);

  return { containerWidth, containerHeight };
};

/**
 * Calculate the optimal scale factor for proportional mountain rendering
 * @param maxDimensions Maximum dimensions among selected mountains
 * @param containerDimensions Available container space
 * @param marginRatio Ratio of margin to leave around triangles (default: 0.1 = 10%)
 * @returns Scale factor to apply to all mountains
 */
export const calculateScaleFactor = (
  maxDimensions: { maxHeight: number; maxWidth: number },
  containerDimensions: { containerWidth: number; containerHeight: number },
  marginRatio: number = 0.1
): number => {
  const { maxHeight, maxWidth } = maxDimensions;
  const { containerWidth, containerHeight } = containerDimensions;

  if (maxHeight === 0 || maxWidth === 0) {
    return 0;
  }

  // Apply margin to available space
  const availableWidth = containerWidth * (1 - marginRatio * 2);
  const availableHeight = containerHeight * (1 - marginRatio * 2);

  // Calculate scale factors for both dimensions
  const widthScale = availableWidth / maxWidth;
  const heightScale = availableHeight / maxHeight;

  // Use the smaller scale to ensure all triangles fit
  return Math.min(widthScale, heightScale);
};

/**
 * Create a complete scale configuration for mountain rendering
 * @param mountains Selected mountains to render
 * @param viewportWidth Current viewport width
 * @param viewportHeight Current viewport height
 * @param padding Optional padding around container
 * @returns Complete scale configuration
 */
export const createScaleConfig = (
  mountains: Mountain[],
  viewportWidth: number,
  viewportHeight: number,
  padding?: number
): ScaleConfig => {
  const { maxHeight, maxWidth } = calculateMaxDimensions(mountains);
  const { containerWidth, containerHeight } = calculateContainerDimensions(
    viewportWidth,
    viewportHeight,
    padding
  );

  return {
    maxHeight,
    maxWidth,
    containerWidth,
    containerHeight,
  };
};

/**
 * Generate SVG path string for an isosceles triangle representing a mountain
 * @param mountain Mountain data to render
 * @param scaleFactor Scale factor to apply to dimensions
 * @returns SVG path string for the triangle
 */
export const generateTrianglePath = (mountain: Mountain, scaleFactor: number): string => {
  const scaledHeight = mountain.height * scaleFactor;
  const scaledWidth = mountain.width * scaleFactor;

  // Create isosceles triangle with base at bottom
  // Top point at center, base points at bottom left and right
  const topX = scaledWidth / 2;
  const topY = 0;
  const bottomLeftX = 0;
  const bottomLeftY = scaledHeight;
  const bottomRightX = scaledWidth;
  const bottomRightY = scaledHeight;

  return `M ${topX} ${topY} L ${bottomLeftX} ${bottomLeftY} L ${bottomRightX} ${bottomRightY} Z`;
};

/**
 * Calculate scaled dimensions for a specific mountain
 * @param mountain Mountain to scale
 * @param scaleFactor Scale factor to apply
 * @returns Scaled width and height
 */
export const calculateScaledDimensions = (
  mountain: Mountain,
  scaleFactor: number
): { scaledWidth: number; scaledHeight: number } => {
  return {
    scaledWidth: mountain.width * scaleFactor,
    scaledHeight: mountain.height * scaleFactor,
  };
};

/**
 * Calculate the viewBox dimensions for an SVG container holding multiple triangles
 * @param mountains Array of mountains to render
 * @param scaleFactor Scale factor applied to mountains
 * @param spacing Spacing between triangles
 * @returns ViewBox dimensions as string
 */
export const calculateSVGViewBox = (
  mountains: Mountain[],
  scaleFactor: number,
  spacing: number = 20
): string => {
  if (mountains.length === 0) {
    return '0 0 100 100';
  }

  const scaledMountains = mountains.map(mountain => calculateScaledDimensions(mountain, scaleFactor));
  
  const totalWidth = scaledMountains.reduce((sum, mountain) => sum + mountain.scaledWidth, 0) + 
                    (mountains.length - 1) * spacing;
  const maxHeight = Math.max(...scaledMountains.map(mountain => mountain.scaledHeight));

  return `0 0 ${totalWidth} ${maxHeight}`;
};