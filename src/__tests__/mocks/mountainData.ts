/**
 * Mock mountain data for testing
 */

import type { Mountain } from '../../types/Mountain';

export const mockMountains: Mountain[] = [
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
    width: 4500,
    country: 'Nepal/India',
    region: 'Himalayas',
  },
  {
    id: 'lhotse',
    name: 'Lhotse',
    height: 8516,
    width: 3800,
    country: 'Nepal/China',
    region: 'Himalayas',
  },
  {
    id: 'makalu',
    name: 'Makalu',
    height: 8485,
    width: 4100,
    country: 'Nepal/China',
    region: 'Himalayas',
  },
  {
    id: 'cho-oyu',
    name: 'Cho Oyu',
    height: 8188,
    width: 3900,
    country: 'Nepal/China',
    region: 'Himalayas',
  },
  {
    id: 'dhaulagiri',
    name: 'Dhaulagiri I',
    height: 8167,
    width: 4300,
    country: 'Nepal',
    region: 'Himalayas',
  },
  {
    id: 'manaslu',
    name: 'Manaslu',
    height: 8163,
    width: 4000,
    country: 'Nepal',
    region: 'Himalayas',
  },
  {
    id: 'nanga-parbat',
    name: 'Nanga Parbat',
    height: 8126,
    width: 4600,
    country: 'Pakistan',
    region: 'Himalayas',
  },
  {
    id: 'annapurna',
    name: 'Annapurna I',
    height: 8091,
    width: 4200,
    country: 'Nepal',
    region: 'Himalayas',
  },
];

export default mockMountains;