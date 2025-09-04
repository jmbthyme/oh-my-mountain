#!/bin/bash

# Mountain Comparison App Deployment Script
# This script builds and deploys the application

set -e  # Exit on any error

echo "🏔️  Mountain Comparison App Deployment"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run quality checks
echo "🔍 Running quality checks..."
npm run type-check
npm run lint
npm run format:check

# Run tests
echo "🧪 Running tests..."
npm run test:run

# Build the application
echo "🏗️  Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Built files are in the 'dist' directory"

# Check if Netlify CLI is available for deployment
if command -v netlify &> /dev/null; then
    echo ""
    read -p "🚀 Deploy to Netlify? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Deploying to Netlify..."
        netlify deploy --prod --dir=dist
        echo "✅ Deployment completed!"
    fi
else
    echo ""
    echo "💡 To deploy to Netlify:"
    echo "   1. Install Netlify CLI: npm install -g netlify-cli"
    echo "   2. Login: netlify login"
    echo "   3. Deploy: netlify deploy --prod --dir=dist"
fi

echo ""
echo "🎉 Deployment process completed!"