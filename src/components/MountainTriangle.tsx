import React from 'react';
import type { MountainTriangleProps } from '../types';
import { generateTrianglePath, calculateScaledDimensions } from '../utils';
import './MountainTriangle.css';

/**
 * MountainTriangle component renders an individual mountain as an SVG triangle
 * with proper scaling, labels, and accessibility features
 * Requirements: 3.1, 3.2, 4.1, 4.2, 4.3, 4.4
 */
const MountainTriangle: React.FC<MountainTriangleProps> = ({
  mountain,
  scale,
  maxDimensions,
}) => {
  const { scaledWidth, scaledHeight } = calculateScaledDimensions(mountain, scale);
  const trianglePath = generateTrianglePath(mountain, scale);

  // Calculate responsive text sizes based on available space
  const baseFontSize = Math.max(10, Math.min(16, scaledWidth / 8));
  const labelFontSize = Math.max(8, Math.min(12, scaledWidth / 10));

  // Generate unique IDs for accessibility
  const triangleId = `triangle-${mountain.id}`;
  const titleId = `title-${mountain.id}`;
  const descId = `desc-${mountain.id}`;

  // Calculate label positions
  const nameX = scaledWidth / 2;
  const nameY = scaledHeight + baseFontSize + 5;
  const heightLabelX = scaledWidth / 2;
  const heightLabelY = scaledHeight / 2;
  const widthLabelX = scaledWidth / 2;
  const widthLabelY = scaledHeight + baseFontSize + labelFontSize + 10;

  // Generate distinct color based on mountain ID
  const getTriangleColor = (id: string): string => {
    const colors = [
      '#2563eb', // blue
      '#dc2626', // red
      '#059669', // green
      '#d97706', // orange
      '#7c3aed', // purple
      '#db2777', // pink
      '#0891b2', // cyan
      '#65a30d', // lime
      '#c2410c', // orange-red
      '#4338ca', // indigo
    ];

    // Simple hash function to get consistent color for same ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const triangleColor = getTriangleColor(mountain.id);

  return (
    <div className="mountain-triangle-container">
      <svg
        width={scaledWidth}
        height={scaledHeight + baseFontSize + labelFontSize + 20}
        viewBox={`0 0 ${scaledWidth} ${scaledHeight + baseFontSize + labelFontSize + 20}`}
        className="mountain-triangle-svg"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
      >
        {/* Accessibility title and description */}
        <title id={titleId}>{mountain.name}</title>
        <desc id={descId}>
          Mountain triangle showing {mountain.name} with height {mountain.height}m and width {mountain.width}m
        </desc>

        {/* Triangle path */}
        <path
          id={triangleId}
          d={trianglePath}
          fill={triangleColor}
          stroke="#1f2937"
          strokeWidth="2"
          className="mountain-triangle-path"
          tabIndex={0}
          role="button"
          aria-label={`${mountain.name} triangle`}
        />

        {/* Mountain name label */}
        <text
          x={nameX}
          y={nameY}
          textAnchor="middle"
          fontSize={baseFontSize}
          fill="#1f2937"
          className="mountain-name-label"
          fontWeight="600"
        >
          {mountain.name}
        </text>

        {/* Height label positioned in center of triangle */}
        <text
          x={heightLabelX}
          y={heightLabelY}
          textAnchor="middle"
          fontSize={labelFontSize}
          fill="white"
          className="mountain-dimension-label height-label"
          fontWeight="500"
        >
          {mountain.height.toLocaleString()}m
        </text>

        {/* Width label positioned below name */}
        <text
          x={widthLabelX}
          y={widthLabelY}
          textAnchor="middle"
          fontSize={labelFontSize}
          fill="#6b7280"
          className="mountain-dimension-label width-label"
        >
          W: {mountain.width.toLocaleString()}m
        </text>

        {/* Optional country/region info if available */}
        {mountain.country && (
          <text
            x={nameX}
            y={widthLabelY + labelFontSize + 5}
            textAnchor="middle"
            fontSize={Math.max(6, labelFontSize - 2)}
            fill="#9ca3af"
            className="mountain-location-label"
          >
            {mountain.country}
          </text>
        )}
      </svg>
    </div>
  );
};

export default MountainTriangle;