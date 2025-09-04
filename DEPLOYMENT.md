# Deployment Guide

This document provides step-by-step instructions for deploying the Mountain Comparison App to Netlify with GitHub integration.

## Prerequisites

- GitHub account
- Netlify account
- Node.js 18+ installed locally
- Git installed locally

## GitHub Repository Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `oh-my-mountain` or your preferred name
3. Make it public (recommended for open source)
4. Don't initialize with README (we already have one)

### 2. Connect Local Repository to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Mountain Comparison App"

# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/oh-my-mountain.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Netlify Deployment Setup

### Option 1: Automatic Deployment via GitHub Integration

1. **Login to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up or login with your GitHub account

2. **Create New Site**
   - Click "New site from Git"
   - Choose "GitHub" as your Git provider
   - Authorize Netlify to access your repositories
   - Select your `oh-my-mountain` repository

3. **Configure Build Settings**
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: Set environment variable `NODE_VERSION` to `18`

4. **Deploy Site**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your app
   - You'll get a random URL like `https://amazing-name-123456.netlify.app`

5. **Custom Domain (Optional)**
   - Go to Site settings > Domain management
   - Add your custom domain
   - Configure DNS settings as instructed

### Option 2: Manual Deployment via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   # Build the application
   npm run build
   
   # Deploy to production
   netlify deploy --prod --dir=dist
   ```

## Environment Variables

If you need to set environment variables in Netlify:

1. Go to Site settings > Environment variables
2. Add your variables:
   - `NODE_VERSION`: `18`
   - Any custom `VITE_*` variables from your `.env.example`

## GitHub Actions Setup (Optional)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for CI/CD:

### Required Secrets

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

1. **NETLIFY_SITE_ID**
   - Go to Netlify Site settings > General > Site details
   - Copy the Site ID

2. **NETLIFY_AUTH_TOKEN**
   - Go to Netlify User settings > Applications > Personal access tokens
   - Create a new token
   - Copy the token

### Workflow Features

- Runs tests on every push and pull request
- Automatically deploys to Netlify on pushes to `main` branch
- Includes linting, formatting checks, and build verification

## Deployment Verification

After deployment, verify your application:

1. **Check Build Logs**
   - Review Netlify build logs for any errors
   - Ensure all assets are properly built

2. **Test Application**
   - Visit your deployed URL
   - Test mountain selection functionality
   - Verify responsive design on different devices
   - Check browser console for errors

3. **Performance Check**
   - Use browser dev tools to check loading times
   - Verify images and assets load correctly
   - Test on different network conditions

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are in `package.json`
   - Check for TypeScript errors

2. **Assets Not Loading**
   - Verify `dist` directory is set as publish directory
   - Check that `mountains.json` is in the `public` folder
   - Ensure proper base URL configuration

3. **Environment Variables**
   - Prefix custom variables with `VITE_`
   - Don't set `NODE_ENV` manually (Vite handles this)
   - Restart deployment after changing variables

### Support

- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/en/actions)
- **Vite Deployment**: [vitejs.dev/guide/static-deploy](https://vitejs.dev/guide/static-deploy.html)

## Monitoring and Maintenance

1. **Analytics** (Optional)
   - Add Netlify Analytics for traffic insights
   - Configure error tracking with services like Sentry

2. **Performance Monitoring**
   - Use Lighthouse for performance audits
   - Monitor Core Web Vitals
   - Set up uptime monitoring

3. **Updates**
   - Regularly update dependencies
   - Monitor security vulnerabilities
   - Keep Node.js version updated

## Rollback Strategy

If you need to rollback a deployment:

1. **Via Netlify Dashboard**
   - Go to Deploys tab
   - Find a previous successful deployment
   - Click "Publish deploy"

2. **Via Git**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   ```

3. **Via CLI**
   ```bash
   # Deploy a specific commit
   netlify deploy --prod --dir=dist
   ```