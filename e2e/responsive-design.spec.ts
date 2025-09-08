import { test, expect } from '@playwright/test';

test.describe('Responsive Design Journey', () => {
  test('should work correctly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="mountain-list"]');
    
    // Check that header is responsive
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    
    // Check that mountain list is scrollable on mobile
    const mountainList = page.locator('[data-testid="mountain-list"]');
    await expect(mountainList).toBeVisible();
    
    // Select a mountain and check that comparison view adapts
    await page.locator('[data-testid="mountain-item-everest"]').click();
    await expect(page.locator('[data-testid="comparison-view"]')).toBeVisible();
    
    // Check that triangle is properly sized for mobile
    const triangle = page.locator('[data-testid="triangle-everest"]');
    await expect(triangle).toBeVisible();
    
    // Verify text is readable on mobile
    await expect(triangle.locator('[data-testid="mountain-name"]')).toBeVisible();
  });

  test('should adapt layout for tablet screens', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await page.waitForSelector('[data-testid="mountain-list"]');
    
    // Select multiple mountains
    await page.locator('[data-testid="mountain-item-everest"]').click();
    await page.locator('[data-testid="mountain-item-k2"]').click();
    await page.locator('[data-testid="mountain-item-kangchenjunga"]').click();
    
    // Check that triangles are arranged properly for tablet
    const triangles = page.locator('[data-testid^="triangle-"]');
    await expect(triangles).toHaveCount(3);
    
    // Verify all triangles are visible without horizontal scrolling
    for (let i = 0; i < 3; i++) {
      await expect(triangles.nth(i)).toBeInViewport();
    }
  });

  test('should handle window resize gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="mountain-list"]');
    
    // Start with desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Select mountains
    await page.locator('[data-testid="mountain-item-everest"]').click();
    await page.locator('[data-testid="mountain-item-k2"]').click();
    
    // Verify triangles are visible
    await expect(page.locator('[data-testid="triangle-everest"]')).toBeVisible();
    await expect(page.locator('[data-testid="triangle-k2"]')).toBeVisible();
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for resize to take effect
    await page.waitForTimeout(500);
    
    // Verify triangles are still visible and properly scaled
    await expect(page.locator('[data-testid="triangle-everest"]')).toBeVisible();
    await expect(page.locator('[data-testid="triangle-k2"]')).toBeVisible();
    
    // Resize back to desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // Verify layout adapts back to desktop
    await expect(page.locator('[data-testid="triangle-everest"]')).toBeVisible();
    await expect(page.locator('[data-testid="triangle-k2"]')).toBeVisible();
  });

  test('should maintain functionality across different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 8
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // iPad Landscape
      { width: 1440, height: 900 }, // Desktop
    ];

    // Set up dialog handler once for all iterations
    page.on('dialog', dialog => dialog.accept());

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForSelector('[data-testid="mountain-list"]');
      
      // Test basic functionality at each viewport
      await page.locator('[data-testid="mountain-item-everest"]').click();
      await expect(page.locator('[data-testid="triangle-everest"]')).toBeVisible();
      
      // Clear selection for next iteration
      await page.locator('[data-testid="clear-all-button"]').click();
      
      // Wait for state to update
      await page.waitForTimeout(500);
      
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    }
  });
});