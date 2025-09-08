# MountainList Component

The `MountainList` component displays a list of available mountains that users can select for comparison.

## Props Interface

```typescript
interface MountainListProps {
  mountains: Mountain[];
  selectedMountains: Mountain[];
  onMountainToggle: (mountain: Mountain) => void;
}
```

### Props Description

- `mountains`: Array of all available mountains to display
- `selectedMountains`: Array of currently selected mountains
- `onMountainToggle`: Callback function called when a mountain is selected/deselected

## Usage Example

```tsx
import { MountainList } from './components/MountainList';
import { Mountain } from './types';

const App = () => {
  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [selectedMountains, setSelectedMountains] = useState<Mountain[]>([]);

  const handleMountainToggle = (mountain: Mountain) => {
    setSelectedMountains(prev => {
      const isSelected = prev.some(m => m.id === mountain.id);
      if (isSelected) {
        return prev.filter(m => m.id !== mountain.id);
      } else {
        return [...prev, mountain];
      }
    });
  };

  return (
    <MountainList
      mountains={mountains}
      selectedMountains={selectedMountains}
      onMountainToggle={handleMountainToggle}
    />
  );
};
```

## Features

### Selection Management
- Displays checkboxes for each mountain
- Visual indication of selected state
- Prevents selection beyond maximum limit (10 mountains)
- Shows warning toast when limit is reached

### Mountain Information Display
- Mountain name prominently displayed
- Height and width information
- Country and region details (if available)
- Formatted numbers with proper units

### Accessibility Features
- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Semantic HTML structure with proper list markup

## Styling

The component uses CSS modules for styling:

```css
/* MountainList.css */
.mountainList {
  /* Container styles */
}

.mountainItem {
  /* Individual mountain item styles */
}

.mountainItem.selected {
  /* Selected state styles */
}

.mountainInfo {
  /* Mountain information layout */
}
```

## Responsive Design

- Mobile-first approach
- Touch-friendly interaction areas
- Scrollable list on smaller screens
- Adaptive text sizing

## Error Handling

- Gracefully handles empty mountain arrays
- Displays appropriate messages for loading states
- Handles invalid mountain data

## Testing

### Unit Tests
```typescript
// Example test
it('should call onMountainToggle when mountain is clicked', () => {
  const mockToggle = vi.fn();
  render(
    <MountainList
      mountains={mockMountains}
      selectedMountains={[]}
      onMountainToggle={mockToggle}
    />
  );
  
  fireEvent.click(screen.getByTestId('mountain-item-everest'));
  expect(mockToggle).toHaveBeenCalledWith(mockMountains[0]);
});
```

### Accessibility Tests
- ARIA label compliance
- Keyboard navigation
- Screen reader compatibility
- Focus management

## Performance Considerations

- Uses React.memo for optimization
- Efficient re-rendering with proper key props
- Minimal DOM updates on selection changes

## Data Requirements

The component expects Mountain objects with this structure:

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

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Keyboard navigation support
- Screen reader compatibility