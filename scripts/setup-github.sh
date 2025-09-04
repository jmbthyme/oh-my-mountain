#!/bin/bash

# GitHub Repository Setup Script
# This script helps set up the GitHub repository for the Mountain Comparison App

set -e  # Exit on any error

echo "🏔️  Mountain Comparison App - GitHub Setup"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed. Please install Git first."
    exit 1
fi

# Get repository URL from user
echo ""
read -p "📝 Enter your GitHub repository URL (e.g., https://github.com/username/oh-my-mountain.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: Repository URL is required."
    exit 1
fi

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Check if there are any commits
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "📦 Creating initial commit..."
    git add .
    git commit -m "Initial commit: Mountain Comparison App

- Complete React TypeScript application
- Mountain comparison with triangular visualizations
- Responsive design for all devices
- Comprehensive test suite
- Production-ready build configuration
- Netlify deployment setup"
else
    echo "✅ Repository already has commits"
fi

# Add remote origin
if git remote get-url origin >/dev/null 2>&1; then
    echo "🔄 Updating remote origin..."
    git remote set-url origin "$REPO_URL"
else
    echo "🔗 Adding remote origin..."
    git remote add origin "$REPO_URL"
fi

# Set main branch
echo "🌿 Setting up main branch..."
git branch -M main

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git push -u origin main; then
    echo "✅ Successfully pushed to GitHub!"
else
    echo "⚠️  Push failed. This might be because:"
    echo "   - The repository already exists and has content"
    echo "   - You need to authenticate with GitHub"
    echo "   - The repository URL is incorrect"
    echo ""
    echo "💡 Try running: git push -u origin main --force"
    echo "   (Only use --force if you're sure you want to overwrite remote content)"
fi

echo ""
echo "🎉 GitHub setup completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Go to your GitHub repository: ${REPO_URL%.git}"
echo "   2. Set up Netlify deployment (see DEPLOYMENT.md)"
echo "   3. Configure GitHub Actions secrets if using CI/CD"
echo ""
echo "📖 For detailed deployment instructions, see DEPLOYMENT.md"