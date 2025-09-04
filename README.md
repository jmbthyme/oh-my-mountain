# Mountain Comparison App

A React-based web application that allows users to visually compare the dimensions of multiple mountains through triangular representations. Built with React, TypeScript, and Vite.

## Features

- 🏔️ **Visual Mountain Comparison**: Compare mountains using proportionally scaled triangular representations
- 📊 **Interactive Selection**: Select up to 10 mountains from a comprehensive list
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development and builds
- 🎯 **Type Safety**: Full TypeScript implementation for robust development
- 🧪 **Comprehensive Testing**: Unit, integration, and performance tests included

## Live Demo

🚀 **[View Live Application](https://your-app-name.netlify.app)** (Replace with actual Netlify URL after deployment)

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/oh-my-mountain.git
cd oh-my-mountain
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
oh-my-mountain/
├── public/
│   ├── mountains.json          # Mountain data
│   └── vite.svg               # Favicon
├── src/
│   ├── components/            # React components
│   │   ├── ComparisonView.tsx
│   │   ├── Header.tsx
│   │   ├── MountainList.tsx
│   │   └── MountainTriangle.tsx
│   ├── hooks/                 # Custom React hooks
│   │   └── useMountains.ts
│   ├── types/                 # TypeScript type definitions
│   │   └── Mountain.ts
│   ├── utils/                 # Utility functions
│   │   └── scaling.ts
│   ├── __tests__/            # Test files
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── netlify.toml              # Netlify deployment configuration
└── package.json              # Project dependencies and scripts
```

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: CSS Modules
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier
- **Deployment**: Netlify

## Data Format

The application loads mountain data from `public/mountains.json`. Each mountain entry includes:

```json
{
  "id": "unique-identifier",
  "name": "Mountain Name",
  "height": 8849,
  "width": 5000,
  "country": "Country Name",
  "region": "Mountain Range"
}
```

## Development Guidelines

### Code Style

- Use TypeScript for all new files
- Follow the existing ESLint and Prettier configuration
- Write tests for new components and utilities
- Use semantic commit messages

### Testing

Run the test suite to ensure everything works correctly:

```bash
# Run all tests
npm run test:run

# Run tests in watch mode during development
npm run test
```

### Performance

The application is optimized for:
- Initial load time < 2 seconds
- Mountain selection/deselection < 500ms
- Smooth responsive behavior across devices

## Deployment

The application is configured for automatic deployment to Netlify:

1. **Automatic Deployment**: Pushes to the `main` branch trigger automatic builds
2. **Build Configuration**: Defined in `netlify.toml`
3. **Environment**: Node.js 18, builds to `dist/` directory

### Manual Deployment

To deploy manually:

```bash
# Build the application
npm run build

# The built files will be in the dist/ directory
# Upload the contents of dist/ to your hosting provider
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm run test:run`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Mountain data sourced from various geographical databases
- Built with the amazing React and Vite ecosystems
- Inspired by the need for intuitive data visualization
