# Development Setup Guide

This guide will help you set up the Mountain Comparison Application for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher)
- **Git** (for version control)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd oh-my-mountain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

## Available Scripts

### Development
- `npm run dev` - Start the development server with hot reload
- `npm run preview` - Preview the production build locally

### Building
- `npm run build` - Build the application for production
- `npm run build:analyze` - Build and analyze bundle size

### Testing
- `npm test` - Run unit tests in watch mode
- `npm run test:run` - Run all tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:accessibility` - Run accessibility tests

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Deployment
- `npm run deploy` - Deploy to production (Netlify)
- `npm run deploy:preview` - Deploy preview version

### Utilities
- `npm run clean` - Clean build artifacts and cache
- `npm run ci` - Run full CI pipeline locally

## Project Structure

```
oh-my-mountain/
├── public/                 # Static assets
│   ├── mountains.json     # Mountain data
│   └── ...
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── __tests__/    # Component tests
│   │   └── *.tsx         # Component files
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── styles/           # Global styles
│   └── test/             # Test setup and utilities
├── e2e/                  # End-to-end tests
├── docs/                 # Documentation
├── dist/                 # Build output (generated)
└── node_modules/         # Dependencies (generated)
```

## Development Workflow

### 1. Feature Development
1. Create a new branch from `main`
2. Make your changes
3. Write tests for new functionality
4. Run the test suite: `npm run ci`
5. Create a pull request

### 2. Testing Strategy
- **Unit Tests**: Test individual components and utilities
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Accessibility Tests**: Ensure ARIA compliance

### 3. Code Quality
The project enforces code quality through:
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks for pre-commit checks

## Environment Configuration

### Development Environment
The development server runs on `http://localhost:5173` by default.

### Environment Variables
Create a `.env.local` file for local environment variables:
```bash
# Example environment variables
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_DEBUG=true
```

## Testing Setup

### Unit Testing
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Setup**: `src/test/setup.ts`

Run tests:
```bash
npm test                    # Watch mode
npm run test:run           # Single run
npm run test:coverage      # With coverage
```

### End-to-End Testing
- **Framework**: Playwright
- **Configuration**: `playwright.config.ts`

Run E2E tests:
```bash
npm run test:e2e           # Headless mode
npm run test:e2e:ui        # With UI
```

### Accessibility Testing
- **Framework**: axe-core
- **Integration**: Jest-axe with Vitest

Run accessibility tests:
```bash
npm run test:accessibility
```

## Performance Monitoring

The application includes built-in performance monitoring:

### Performance Benchmarks
- Data loading time (< 2 seconds)
- Interaction response time (< 500ms)
- Memory usage monitoring
- Triangle rendering performance

### Web Vitals
- First Contentful Paint
- Largest Contentful Paint
- Cumulative Layout Shift

## Debugging

### Development Tools
- **React Developer Tools**: Browser extension for React debugging
- **Vite DevTools**: Built-in development server features
- **TypeScript**: Compile-time error checking

### Common Issues

#### Port Already in Use
If port 5173 is busy:
```bash
npm run dev -- --port 3000
```

#### Module Resolution Issues
Clear the cache:
```bash
npm run clean
npm install
```

#### TypeScript Errors
Run type checking:
```bash
npm run type-check
```

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow the existing component structure
- Write tests for new features
- Update documentation as needed

### Commit Messages
Follow conventional commit format:
```
feat: add new mountain selection feature
fix: resolve triangle scaling issue
docs: update development setup guide
test: add accessibility tests for MountainList
```

### Pull Request Process
1. Ensure all tests pass
2. Update documentation if needed
3. Add screenshots for UI changes
4. Request review from maintainers

## Troubleshooting

### Common Development Issues

#### Slow Development Server
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart the development server

#### Test Failures
- Check test setup in `src/test/setup.ts`
- Ensure all dependencies are installed
- Run tests individually to isolate issues

#### Build Failures
- Check TypeScript errors: `npm run type-check`
- Verify all imports are correct
- Check for missing dependencies

### Getting Help

- Check the [documentation](./README.md)
- Review existing [issues](https://github.com/your-repo/issues)
- Ask questions in discussions

## Performance Tips

### Development Performance
- Use React DevTools Profiler
- Monitor bundle size with `npm run build:analyze`
- Check for unnecessary re-renders

### Production Performance
- Enable production build optimizations
- Use performance monitoring tools
- Monitor Web Vitals in production