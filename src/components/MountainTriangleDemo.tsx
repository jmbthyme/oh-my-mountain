import React from 'react';
import MountainTriangle from './MountainTriangle';
import type { Mountain } from '../types';

/**
 * Demo component to test MountainTriangle functionality
 * This can be used to manually verify the component works correctly
 */
const MountainTriangleDemo: React.FC = () => {
  const sampleMountains: Mountain[] = [
    {
      id: 'everest',
      name: 'Mount Everest',
      height: 8849,
      width: 5000,
      country: 'Nepal/China',
      region: 'Himalayas',
    },
    {
      id: 'k2',
      name: 'K2',
      height: 8611,
      width: 4200,
      country: 'Pakistan/China',
      region: 'Karakoram',
    },
    {
      id: 'kangchenjunga',
      name: 'Kangchenjunga',
      height: 8586,
      width: 4800,
      country: 'Nepal/India',
      region: 'Himalayas',
    },
  ];

  const scale = 0.02;
  const maxDimensions = { height: 8849, width: 5000 };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <h2>Mountain Triangle Demo</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {sampleMountains.map((mountain) => (
          <MountainTriangle
            key={mountain.id}
            mountain={mountain}
            scale={scale}
            maxDimensions={maxDimensions}
          />
        ))}
      </div>
    </div>
  );
};

export default MountainTriangleDemo;