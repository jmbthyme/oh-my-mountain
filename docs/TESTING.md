# Testing Documentation

This document provides comprehensive information about the testing strategy, tools, and procedures for the Mountain Comparison Application.

## Testing Strategy Overview

The application uses a multi-layered testing approach to ensure reliability, accessibility, and performance:

1. **Unit Tests** - Test individual components and utilities
2. **Integration Tests** - Test component interactions and workflows
3. **End-to-End Tests** - Test complete user journeys
4. **Accessibility Tests** - Ensure ARIA compliance and keyboard navigation
5. **Performance Tests** - Verify loading times and interaction responsiveness

## Test Suites

### 1. Unit Tests

**Framework**: Vitest with React Testing Library  
**Location**: `src/**/__tests__/*.test.{ts,tsx}`  
**Command**: `npm run test:run`

#### Coverage Areas
- Component rendering and behavior
- Utility function logic
- Hook functionality
- Data validation
- Error handling

#### Example Test Structure
```typescript
describe('MountainList Component', () => {
  it('should render mountain items correctly', () => {
    render(<MountainList mountains={mockData} />);
    expect(screen.getByText('Mount Everest')).toBeInTheDocument();
  });
});
```

### 2. Accessibility Tests

**Framework**: axe-core with jest-axe  
**Location**: `src/**/__tests__/*.a11y.test.{ts,tsx}`  
**Command**: `npm run test:accessibility`

#### Coverage Areas
- ARIA labels and descriptions
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Semantic HTML structure

#### Example Test Structure
```typescript
describe('MountainList Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<MountainList />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 3. End-to-End Tests

**Framework**: Playwright  
**Location**: `e2e/*.spec.ts`  
**Command**: `npm run test:e2e`

#### Coverage Areas
- Complete user workflows
- Cross-browser compatibility
- Responsive design behavior
- Error handling scenarios
- Performance under real conditions

#### Test Scenarios
- Mountain selection and comparison
- Error handling and recovery
- Responsive design adaptation
- Accessibility with real browsers

### 4. Performance Tests

**Framework**: Custom benchmarking utilities  
**Location**: `src/__tests__/performance-benchmarks.test.ts`  
**Command**: `npm run test:performance`

#### Performance Metrics
- Data loading time (< 2 seconds)
- Interaction response time (< 500ms)
- Memory usage monitoring
- Triangle rendering performance
- Web Vitals (FCP, LCP)

## Running Tests

### Individual Test Suites

```bash
# Unit tests
npm run test:run

# Unit tests with coverage
npm run test:coverage

# Accessibility tests
npm run test:accessibility

# End-to-end tests
npm run test:e2e

# End-to-end tests with UI
npm run test:e2e:ui

# Performance tests
npm run test:performance
```

### Comprehensive Test Suite

```bash
# Run all tests with detailed reporting
npm run test:all

# Run specific test types
node scripts/test-runner.js --unit
node scripts/test-runner.js --a11y
node scripts/test-runner.js --e2e
node scripts/test-runner.js --performance
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

### Playwright Configuration (`playwright.config.ts`)
```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

## Test Data and Mocks

### Mock Data Structure
```typescript
const mockMountains: Mountain[] = [
  {
    id: 'everest',
    name: 'Mount Everest',
    height: 8849,
    width: 5000,
    country: 'Nepal/China',
    region: 'Himalayas'
  }
];
```

### API Mocking
```typescript
// Mock fetch for data loading tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => mockMountainData
});
```

## Performance Benchmarks

### Benchmark Thresholds
```typescript
export const PERFORMANCE_THRESHOLDS = {
  DATA_LOAD_TIME: 2000,        // 2 seconds
  INTERACTION_TIME: 500,       // 500ms
  TRIANGLE_RENDER_TIME: 100,   // 100ms per triangle
  MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
  FIRST_CONTENTFUL_PAINT: 1500,   // 1.5 seconds
  LARGEST_CONTENTFUL_PAINT: 2500, // 2.5 seconds
};
```

### Running Benchmarks
```typescript
// Measure data loading performance
const result = await measureDataLoadTime(loadMountainData);
console.log(`Load time: ${result.value}ms (${result.passed ? 'PASS' : 'FAIL'})`);
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:all
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:run && npm run lint"
    }
  }
}
```

## Test Reporting

### Coverage Reports
- HTML coverage report: `coverage/index.html`
- JSON coverage data: `coverage/coverage-final.json`
- Text summary in terminal

### E2E Test Reports
- HTML report: `playwright-report/index.html`
- Screenshots and videos for failed tests
- Trace files for debugging

### Comprehensive Test Report
The test runner generates a detailed JSON report:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "totalDuration": 45000,
  "summary": {
    "total": 4,
    "passed": 4,
    "failed": 0
  },
  "results": {
    "unit": { "passed": true, "duration": 15000 },
    "accessibility": { "passed": true, "duration": 8000 },
    "e2e": { "passed": true, "duration": 20000 },
    "performance": { "passed": true, "duration": 2000 }
  }
}
```

## Debugging Tests

### Unit Test Debugging
```bash
# Run tests in watch mode
npm test

# Run specific test file
npm test -- MountainList.test.tsx

# Run with debugging
npm test -- --inspect-brk
```

### E2E Test Debugging
```bash
# Run with UI for visual debugging
npm run test:e2e:ui

# Run in headed mode
npx playwright test --headed

# Debug specific test
npx playwright test --debug mountain-selection.spec.ts
```

### Common Debugging Techniques
1. Use `screen.debug()` in React Testing Library tests
2. Add `await page.pause()` in Playwright tests
3. Check browser developer tools in headed mode
4. Review test artifacts (screenshots, videos, traces)

## Best Practices

### Writing Tests
1. **Arrange, Act, Assert** pattern
2. Use descriptive test names
3. Test behavior, not implementation
4. Mock external dependencies
5. Keep tests independent and isolated

### Accessibility Testing
1. Test with keyboard navigation
2. Verify ARIA labels and roles
3. Check color contrast
4. Test with screen readers
5. Ensure focus management

### Performance Testing
1. Set realistic thresholds
2. Test on various devices
3. Monitor memory usage
4. Measure real user metrics
5. Test under load conditions

### E2E Testing
1. Test critical user paths
2. Use stable selectors (data-testid)
3. Handle async operations properly
4. Test error scenarios
5. Verify responsive behavior

## Troubleshooting

### Common Issues

#### Test Timeouts
```typescript
// Increase timeout for slow operations
await waitFor(() => {
  expect(screen.getByTestId('mountain-list')).toBeInTheDocument();
}, { timeout: 10000 });
```

#### Flaky Tests
- Use proper wait conditions
- Avoid hard-coded delays
- Mock time-dependent operations
- Ensure test isolation

#### Memory Leaks
- Clean up event listeners
- Clear timers and intervals
- Reset mocks between tests
- Monitor memory usage

### Getting Help
1. Check test logs and error messages
2. Review test artifacts (screenshots, videos)
3. Use debugging tools and breakpoints
4. Consult framework documentation
5. Ask for help in team discussions

## Maintenance

### Regular Tasks
- Update test dependencies monthly
- Review and update performance thresholds
- Add tests for new features
- Remove obsolete tests
- Monitor test execution times

### Test Quality Metrics
- Code coverage percentage
- Test execution time
- Flaky test rate
- Bug detection rate
- Performance benchmark trends