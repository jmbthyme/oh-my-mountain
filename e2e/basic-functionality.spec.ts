import { test, expect } from '@playwright/test';

test.describe('Basic Application Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the application to load completely
    await page.waitForLoadState('networkidle');

    // Wait for the mountain list to be visible
    await page.waitForSelector('[data-testid="mountain-list"]', { timeout: 15000 });
  });

  test('should load the application successfully', async ({ page }) => {
    // Check that the main components are visible
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    await expect(page.locator('[data-testid="mountain-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="comparison-view"]')).toBeVisible();

    // Check that the empty state is shown initially
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });

  test('should display mountain items', async ({ page }) => {
    // Check that mountain items are loaded
    const mountainItems = page.locator('[data-testid^="mountain-item-"]');
    await expect(mountainItems.first()).toBeVisible({ timeout: 10000 });

    // Verify we have the expected number of mountains (22 from mountains.json)
    const count = await mountainItems.count();
    expect(count).toBe(22);
  });

  test('should select and display a mountain', async ({ page }) => {
    // Select the first available mountain (Everest)
    const everestItem = page.locator('[data-testid="mountain-item-everest"]');
    await expect(everestItem).toBeVisible();
    await everestItem.click();

    // Check that the mountain is selected
    await expect(everestItem).toHaveAttribute('aria-checked', 'true');

    // Check that the triangle appears in the comparison view
    const triangle = page.locator('[data-testid="triangle-everest"]');
    await expect(triangle).toBeVisible({ timeout: 5000 });

    // Check that the empty state is no longer visible
    await expect(page.locator('[data-testid="empty-state"]')).not.toBeVisible();
  });

  test('should update selection count', async ({ page }) => {
    // Initially should show 0 selected (check header count)
    await expect(page.locator('[data-testid="header"] [data-testid="selected-count"]')).toContainText('0');

    // Select a mountain
    await page.locator('[data-testid="mountain-item-everest"]').click();

    // Should now show 1 selected
    await expect(page.locator('[data-testid="header"] [data-testid="selected-count"]')).toContainText('1');

    // Select another mountain
    await page.locator('[data-testid="mountain-item-k2"]').click();

    // Should now show 2 selected
    await expect(page.locator('[data-testid="header"] [data-testid="selected-count"]')).toContainText('2');
  });

  test('should clear all selections', async ({ page }) => {
    // Select a few mountains
    await page.locator('[data-testid="mountain-item-everest"]').click();
    await page.locator('[data-testid="mountain-item-k2"]').click();

    // Verify selections (check header count)
    await expect(page.locator('[data-testid="header"] [data-testid="selected-count"]')).toContainText('2');

    // Click clear all button and handle confirmation dialog
    const clearButton = page.locator('[data-testid="clear-all-button"]');
    await expect(clearButton).toBeVisible();

    // Handle the confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    await clearButton.click();

    // Wait a moment for the state to update
    await page.waitForTimeout(500);

    // Should show 0 selected
    await expect(page.locator('[data-testid="header"] [data-testid="selected-count"]')).toContainText('0');

    // Empty state should be visible again
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });
});