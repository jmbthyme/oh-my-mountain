# Component Documentation

This directory contains detailed documentation for all React components in the Mountain Comparison Application.

## Component Overview

The application is built with a modular component architecture, where each component has a specific responsibility:

### Core Components

- **[App](./App.md)** - Root application component managing global state
- **[Header](./Header.md)** - Application header with title and controls
- **[MountainList](./MountainList.md)** - List of selectable mountains
- **[ComparisonView](./ComparisonView.md)** - Container for mountain visualizations
- **[MountainTriangle](./MountainTriangle.md)** - Individual mountain triangle visualization

### Utility Components

- **[ErrorBoundary](./ErrorBoundary.md)** - Error handling wrapper component
- **[LoadingSpinner](./LoadingSpinner.md)** - Loading state indicator
- **[SkeletonLoader](./SkeletonLoader.md)** - Skeleton loading placeholder
- **[Toast](./Toast.md)** - Notification message component
- **[ToastContainer](./ToastContainer.md)** - Container for managing toasts

## Component Architecture

```
App
├── ErrorBoundary
│   ├── Header
│   ├── MountainList
│   └── ComparisonView
│       └── MountainTriangle (multiple)
├── ToastContainer
│   └── Toast (multiple)
└── LoadingSpinner / SkeletonLoader
```

## Design Principles

### 1. Single Responsibility
Each component has one clear purpose and handles a specific part of the application functionality.

### 2. Props Interface
All components use TypeScript interfaces for props, ensuring type safety and clear contracts.

### 3. Accessibility First
Components are built with accessibility in mind, including proper ARIA labels, keyboard navigation, and screen reader support.

### 4. Responsive Design
Components adapt to different screen sizes and orientations using CSS modules and responsive design patterns.

### 5. Error Handling
Components handle errors gracefully and provide meaningful feedback to users.

## Usage Patterns

### State Management
- Global state is managed in the App component using React hooks
- Local component state is used for UI-specific interactions
- Props are passed down through the component tree

### Event Handling
- User interactions are handled through callback props
- Events bubble up from child components to parent components
- Side effects are managed using useEffect hooks

### Styling
- CSS Modules are used for component-specific styles
- Global styles are defined in the styles directory
- Responsive breakpoints are consistent across components

## Testing Strategy

Each component includes:
- Unit tests for component behavior
- Accessibility tests for ARIA compliance
- Integration tests for component interactions
- Visual regression tests (where applicable)

## Getting Started

To use these components in your development:

1. Import the component from the components directory
2. Check the component's documentation for required props
3. Ensure proper TypeScript types are used
4. Follow the accessibility guidelines outlined in each component's docs

## Contributing

When adding new components:

1. Create the component file in `src/components/`
2. Add corresponding test files in `src/components/__tests__/`
3. Create documentation in `docs/components/`
4. Update this README with the new component
5. Ensure accessibility compliance
6. Add proper TypeScript interfaces