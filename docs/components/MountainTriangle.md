# MountainTriangle Component

The `MountainTriangle` component renders an individual mountain as an SVG triangle with proper scaling and labeling.

## Props Interface

```typescript
interface MountainTriangleProps {
  mountain: Mountain;
  scaleConfig: ScaleConfig;
}
```

### Props Description

- `mountain`: The mountain data to visualize
- `scaleConfig`: Configuration object containing scaling parameters

## Usage Example

```tsx
import { MountainTriangle } from './components/MountainTriangle';
import { Mountain, ScaleConfig } from './types';

const ComparisonView = ({ selectedMountains }: { selectedMountains: Mountain[] }) => {
  const scaleConfig = calculateScaleConfig(selectedMountains, containerDimensions);

  return (
    <div className="comparison-grid">
      {selectedMountains.map(mountain => (
        <MountainTriangle
          key={mountain.id}
          mountain={mountain}
          scaleConfig={scaleConfig}
        />
      ))}
    </div>
  );
};
```

## Features

### SVG Triangle Rendering
- Proportionally scaled triangles based on mountain dimensions
- Isosceles triangle shape representing mountain profile
- Consistent scaling across all triangles for accurate comparison
- Smooth rendering at all screen sizes

### Information Display
- Mountain name positioned below triangle
- Height and width labels with proper formatting
- Country and region information (when available)
- Responsive text sizing based on available space

### Interactive Features
- Hover effects for enhanced user experience
- Focus states for keyboard navigation
- Smooth transitions and animations
- Touch-friendly interactions on mobile

### Accessibility Features
- Proper ARIA labels and descriptions
- SVG title and description elements
- Keyboard focusable
- Screen reader compatible
- High contrast mode support

## Scaling Algorithm

The component uses a proportional scaling system:

```typescript
const calculateTriangleDimensions = (mountain: Mountain, scaleConfig: ScaleConfig) => {
  const scale = Math.min(
    scaleConfig.containerHeight / scaleConfig.maxHeight,
    scaleConfig.containerWidth / scaleConfig.maxWidth
  );
  
  return {
    height: mountain.height * scale,
    width: mountain.width * scale
  };
};
```

## SVG Structure

```xml
<svg role="img" aria-labelledby="title-{id}" aria-describedby="desc-{id}">
  <title id="title-{id}">Mountain Name</title>
  <desc id="desc-{id}">Triangle representing mountain with height X and width Y</desc>
  <path d="M ... L ... L ... Z" />
</svg>
```

## Styling

The component uses CSS modules for styling:

```css
/* MountainTriangle.css */
.triangleContainer {
  /* Container layout and positioning */
}

.triangle {
  /* SVG triangle styles */
  fill: var(--mountain-color);
  stroke: var(--mountain-border);
  transition: all 0.3s ease;
}

.triangle:hover {
  /* Hover state styles */
}

.mountainInfo {
  /* Text information layout */
}

.mountainName {
  /* Mountain name styling */
}

.mountainDimensions {
  /* Height and width text styling */
}
```

## Responsive Design

- Scales appropriately on all screen sizes
- Text remains readable at small sizes
- Touch-friendly interaction areas
- Maintains aspect ratios across devices

## Performance Optimizations

- Memoized with React.memo
- Efficient SVG path calculations
- Minimal re-renders on prop changes
- Optimized for multiple triangles

## Error Handling

- Handles invalid mountain data gracefully
- Fallback rendering for missing dimensions
- Error boundaries catch rendering issues
- Graceful degradation for unsupported features

## Testing

### Unit Tests
```typescript
// Example test
it('should render triangle with correct dimensions', () => {
  const mockMountain = { id: 'test', name: 'Test', height: 1000, width: 500 };
  const mockScale = { maxHeight: 2000, maxWidth: 1000, containerHeight: 400, containerWidth: 600 };
  
  render(<MountainTriangle mountain={mockMountain} scaleConfig={mockScale} />);
  
  const svg = screen.getByRole('img');
  expect(svg).toBeInTheDocument();
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Accessibility Tests
- ARIA compliance
- Keyboard navigation
- Screen reader announcements
- Focus management

## Browser Support

- Modern browsers with SVG support
- Mobile browsers
- High contrast mode
- Reduced motion preferences
- Screen reader compatibility

## Data Requirements

### Mountain Interface
```typescript
interface Mountain {
  id: string;
  name: string;
  height: number; // in meters
  width: number;  // in meters
  country?: string;
  region?: string;
}
```

### ScaleConfig Interface
```typescript
interface ScaleConfig {
  maxHeight: number;
  maxWidth: number;
  containerHeight: number;
  containerWidth: number;
}
```

## Customization

The component supports customization through:
- CSS custom properties for colors
- Configurable scaling parameters
- Responsive breakpoints
- Animation preferences