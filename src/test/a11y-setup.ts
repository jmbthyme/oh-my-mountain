import { expect } from 'vitest';
import { configureAxe } from 'jest-axe';

// Configure axe for testing
const axe = configureAxe({
  rules: {
    // Disable color-contrast rule for now as it can be flaky in tests
    'color-contrast': { enabled: false },
  },
});

// Add toHaveNoViolations matcher
expect.extend({
  toHaveNoViolations(received) {
    if (received.violations.length === 0) {
      return {
        pass: true,
        message: () => 'Expected accessibility violations, but none were found'
      };
    }
    
    const violationMessages = received.violations.map(violation => 
      `${violation.id}: ${violation.description}`
    ).join('\n');
    
    return {
      pass: false,
      message: () => `Expected no accessibility violations, but found:\n${violationMessages}`
    };
  }
});

// Configure axe for consistent testing
export const axeConfig = {
  rules: {
    // Disable color-contrast rule for now as it can be flaky in tests
    'color-contrast': { enabled: false },
  },
};

export { axe };