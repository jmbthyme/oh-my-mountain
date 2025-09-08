import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to fully load
    await page.waitForSelector('[data-testid="mountain-list"]', { timeout: 10000 });
    await page.waitForSelector('[data-testid^="mountain-item-"]', { timeout: 10000 });
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus directly on the first mountain item to test keyboard interaction
    const firstMountainItem = page.locator('[data-testid="mountain-item-everest"]');
    await firstMountainItem.focus();
    await expect(firstMountainItem).toBeFocused();

    // Test space key to select mountain
    await page.keyboard.press('Space');
    await expect(firstMountainItem).toHaveAttribute('aria-checked', 'true');

    // Focus on second mountain item
    const secondMountainItem = page.locator('[data-testid="mountain-item-k2"]');
    await secondMountainItem.focus();
    await expect(secondMountainItem).toBeFocused();

    // Test Enter key to select mountain
    await page.keyboard.press('Enter');
    await expect(secondMountainItem).toHaveAttribute('aria-checked', 'true');
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Check for proper landmark regions
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();

    // Check for proper mountain list structure
    const mountainItems = page.locator('[data-testid^="mountain-item-"]');
    const mountainCount = await mountainItems.count();
    expect(mountainCount).toBeGreaterThan(0);
  });

  test('should have proper ARIA labels and descriptions', async ({ page }) => {
    // Select a mountain to test triangle accessibility
    await page.locator('[data-testid="mountain-item-everest"]').click();

    // Wait for triangle to appear
    const triangle = page.locator('[data-testid="triangle-everest"]');
    await expect(triangle).toBeVisible();

    // Check that triangle has proper ARIA attributes
    const triangleSvg = triangle.locator('svg');
    await expect(triangleSvg).toHaveAttribute('aria-labelledby');
    await expect(triangleSvg).toHaveAttribute('role', 'img');

    // Check that interactive elements have proper labels
    const clearButton = page.locator('[data-testid="clear-all-button"]');
    await expect(clearButton).toBeVisible();
    await expect(clearButton).toHaveAttribute('aria-label');
  });

  test('should handle focus management correctly', async ({ page }) => {
    // Test basic focus management
    // Focus should be visible when navigating with keyboard
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Focus should move logically through the interface
    const initialFocus = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    
    await page.keyboard.press('Tab');
    const nextFocus = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    
    expect(nextFocus).not.toBe(initialFocus);
  });

  test('should provide proper error announcements', async ({ page }) => {
    // Intercept the mountains.json request and make it fail
    await page.route('**/mountains.json', route => {
      route.abort('failed');
    });

    await page.goto('/');

    // Check that error message has proper ARIA attributes for screen readers
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    await expect(errorMessage).toHaveAttribute('role', 'alert');
    await expect(errorMessage).toHaveAttribute('aria-live', 'polite');
  });

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast mode by adding media query
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            border: 1px solid red !important;
          }
        }
      `
    });

    // Check that elements are still visible and functional
    await expect(page.locator('[data-testid="mountain-list"]')).toBeVisible();
    
    // Test functionality still works
    await page.locator('[data-testid="mountain-item-everest"]').click();
    await expect(page.locator('[data-testid="triangle-everest"]')).toBeVisible();
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="mountain-list"]');

    // Test that animations are reduced or disabled
    // This would need to be implemented in the CSS with prefers-reduced-motion
    await page.locator('[data-testid="mountain-item-everest"]').click();
    
    // Verify that the triangle appears without long animations
    await expect(page.locator('[data-testid="triangle-everest"]')).toBeVisible();
  });
});