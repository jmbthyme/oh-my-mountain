# Deployment Guide

This guide covers deploying the Mountain Comparison Application to various platforms, with a focus on Netlify as the primary deployment target.

## Netlify Deployment (Recommended)

### Automatic Deployment Setup

1. **Connect Repository to Netlify**
   - Log in to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables** (if needed)
   - Go to Site settings > Environment variables
   - Add any required environment variables

4. **Deploy**
   - Netlify will automatically deploy on every push to the main branch
   - Preview deployments are created for pull requests

### Manual Deployment

For one-time or manual deployments:

```bash
# Build the application
npm run build

# Deploy to Netlify (requires Netlify CLI)
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### Netlify Configuration

The project includes a `netlify.toml` file with optimized settings:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Alternative Deployment Platforms

### Vercel

1. **Setup**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configuration** (`vercel.json`)
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

### GitHub Pages

1. **Setup GitHub Actions** (`.github/workflows/deploy.yml`)
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Configure Repository**
   - Go to Settings > Pages
   - Select "Deploy from a branch"
   - Choose `gh-pages` branch

### AWS S3 + CloudFront

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure error pages for SPA routing

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass: `npm run test:run`
- [ ] No linting errors: `npm run lint`
- [ ] Code is formatted: `npm run format:check`
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Build succeeds: `npm run build`

### Performance
- [ ] Bundle size is acceptable: `npm run build:analyze`
- [ ] Performance benchmarks pass
- [ ] Accessibility tests pass: `npm run test:accessibility`
- [ ] E2E tests pass: `npm run test:e2e`

### Content
- [ ] Mountain data is up to date
- [ ] All images are optimized
- [ ] Meta tags are configured
- [ ] Favicon is included

## Environment Configuration

### Production Environment Variables

Create environment-specific configurations:

```bash
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ANALYTICS_ID=your-analytics-id
VITE_ENVIRONMENT=production
```

### Build Optimization

The production build includes:
- Code minification
- Tree shaking
- Asset optimization
- Bundle splitting
- Compression

## Monitoring and Analytics

### Performance Monitoring

1. **Web Vitals**
   - Monitor Core Web Vitals in production
   - Set up alerts for performance regressions

2. **Error Tracking**
   - Integrate error tracking service (e.g., Sentry)
   - Monitor JavaScript errors and crashes

3. **Analytics**
   - Set up Google Analytics or similar
   - Track user interactions and conversions

### Health Checks

Create monitoring endpoints:
- Application health check
- API connectivity check
- Performance metrics endpoint

## Security Considerations

### Content Security Policy

Configure CSP headers in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### HTTPS

- Ensure HTTPS is enabled
- Configure HSTS headers
- Use secure cookies if applicable

## Rollback Strategy

### Automated Rollback

1. **Netlify**
   - Use Netlify's built-in rollback feature
   - Deploy previous version from dashboard

2. **Git-based Rollback**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

### Manual Rollback

1. Keep previous build artifacts
2. Have rollback procedures documented
3. Test rollback process regularly

## Continuous Deployment

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run ci
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Troubleshooting Deployment Issues

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

#### Routing Issues (SPA)
- Ensure proper redirect rules are configured
- Check that `index.html` serves for all routes

#### Performance Issues
- Analyze bundle size
- Check for large assets
- Verify CDN configuration

#### Environment Variable Issues
- Ensure all required variables are set
- Check variable naming (VITE_ prefix for Vite)
- Verify variable values in deployment platform

### Debug Commands

```bash
# Local production build test
npm run build
npm run preview

# Check bundle size
npm run build:analyze

# Test production build locally
npx serve dist

# Check for build issues
npm run build -- --debug
```

## Post-Deployment Verification

### Automated Checks
- [ ] Application loads successfully
- [ ] All routes work correctly
- [ ] API endpoints respond
- [ ] Performance metrics are acceptable

### Manual Testing
- [ ] Test core user workflows
- [ ] Verify responsive design
- [ ] Check accessibility features
- [ ] Test error handling

### Monitoring Setup
- [ ] Configure uptime monitoring
- [ ] Set up performance alerts
- [ ] Enable error tracking
- [ ] Monitor user analytics

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review performance metrics weekly
- Check security vulnerabilities
- Update documentation as needed

### Backup Strategy
- Regular database backups (if applicable)
- Source code is version controlled
- Configuration backups
- Asset backups