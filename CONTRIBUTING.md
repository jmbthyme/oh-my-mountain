# Contributing to Mountain Comparison App

Thank you for your interest in contributing to the Mountain Comparison App! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Git

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/oh-my-mountain.git
   cd oh-my-mountain
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Application

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

### Code Standards

- **TypeScript**: All new code should be written in TypeScript
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code is automatically formatted with Prettier
- **Testing**: Write tests for new components and utilities

### Commit Messages

Use conventional commit format:
- `feat: add new mountain selection feature`
- `fix: resolve triangle scaling issue`
- `docs: update README with deployment info`
- `test: add tests for MountainTriangle component`

## Testing Guidelines

### Writing Tests

- Place test files in `src/__tests__/` directory
- Use descriptive test names
- Test both happy path and error cases
- Aim for good test coverage

### Running Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run specific test file
npm run test -- MountainTriangle.test.tsx
```

## Component Guidelines

### Component Structure

```typescript
// ComponentName.tsx
import React from 'react';
import './ComponentName.css';

interface ComponentNameProps {
  // Define props with TypeScript
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  // destructure props 
}) => {
  // Component logic
  
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};
```

### Styling

- Use CSS Modules for component-specific styles
- Follow BEM naming convention for CSS classes
- Ensure responsive design for all screen sizes
- Use semantic HTML elements

## Pull Request Process

1. **Create Feature Branch**: Always work on a feature branch
2. **Write Tests**: Include tests for new functionality
3. **Update Documentation**: Update README or other docs if needed
4. **Run Quality Checks**: Ensure all tests pass and code is formatted
5. **Create Pull Request**: Provide clear description of changes
6. **Code Review**: Address any feedback from reviewers

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if needed
```

## Issue Reporting

### Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/OS information
- Screenshots if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use case or problem it solves
- Proposed implementation approach
- Any relevant mockups or examples

## Code Review Guidelines

### For Reviewers

- Be constructive and respectful
- Focus on code quality and maintainability
- Check for test coverage
- Verify documentation updates
- Test the changes locally if possible

### For Contributors

- Respond to feedback promptly
- Ask questions if feedback is unclear
- Make requested changes in separate commits
- Update the PR description if scope changes

## Release Process

1. Version bumping follows semantic versioning
2. Releases are tagged and deployed automatically
3. Changelog is maintained for each release
4. Breaking changes are clearly documented

## Getting Help

- Check existing issues and documentation first
- Create an issue for bugs or feature requests
- Join discussions in existing issues
- Reach out to maintainers for guidance

## Recognition

Contributors will be recognized in:
- README acknowledgments
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to make this project better! 🏔️