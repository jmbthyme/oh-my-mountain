import { test, expect } from '@playwright/test';

test.describe('Mountain Selection Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('[data-testid="mountain-list"]');
  });

  test('should load the application and display mountain list', async ({ page }) => {
    // Check that the header is visible
    await expect(page.locator('[data-testid="header"]')).toBeVisible();
    
    // Check that the mountain list is loaded
    await expect(page.locator('[data-testid="mountain-list"]')).toBeVisible();
    
    // Check that mountains are displayed
    const mountainItems = page.locator('[data-testid^="mountain-item-"]');
    await expect(mountainItems).toHaveCount(22); // Based on mountains.json
  });

  test('should select and deselect mountains', async ({ page }) => {
    // Select first mountain
    const firstMountain = page.locator('[data-testid="mountain-item-everest"]');
    await firstMountain.click();
    
    // Check that mountain is selected (checkbox should be checked)
    const checkbox = firstMountain.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
    
    // Check that comparison view shows the selected mountain
    await expect(page.locator('[data-testid="comparison-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="triangle-everest"]')).toBeVisible();
    
    // Deselect the mountain
    await firstMountain.click();
    await expect(checkbox).not.toBeChecked();
    
    // Check that comparison view shows empty state
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });

  test('should handle multiple mountain selection', async ({ page }) => {
    // Select multiple mountains
    const mountains = ['everest', 'k2', 'kangchenjunga'];
    
    for (const mountainId of mountains) {
      await page.locator(`[data-testid="mountain-item-${mountainId}"]`).click();
    }
    
    // Check that all selected mountains appear in comparison view
    for (const mountainId of mountains) {
      await expect(page.locator(`[data-testid="triangle-${mountainId}"]`)).toBeVisible();
    }
    
    // Check header shows correct count
    await expect(page.locator('[data-testid="header"] [data-testid="selected-count"]')).toContainText('3');
  });

  test('should enforce maximum selection limit', async ({ page }) => {
    // Select 10 mountains (the maximum)
    const mountainIds = ['everest', 'k2', 'kangchenjunga', 'lhotse', 'makalu', 'cho-oyu', 'dhaulagiri', 'manaslu', 'nanga-parbat', 'annapurna'];
    
    for (const mountainId of mountainIds) {
      await page.locator(`[data-testid="mountain-item-${mountainId}"]`).click();
      // Wait a bit between selections to avoid overwhelming the UI
      await page.waitForTimeout(100);
    }
    
    // Verify we have 10 selections
    await expect(page.locator('[data-testid="header"] [data-testid="selected-count"]')).toContainText('10');
    
    // Try to select one more mountain - this should show the warning
    // Use force: true since the element will be disabled but we want to test the click behavior
    await page.locator('[data-testid="mountain-item-gasherbrum-i"]').click({ force: true });
    
    // Check that the warning toast appears in the mountain list
    const warningToast = page.locator('.mountain-list__warning[data-testid="toast"]');
    await expect(warningToast).toBeVisible();
    await expect(warningToast).toContainText('Maximum');
    
    // Check that the 11th mountain is not selected
    const eleventhMountainCheckbox = page.locator('[data-testid="mountain-item-gasherbrum-i"] input[type="checkbox"]');
    await expect(eleventhMountainCheckbox).not.toBeChecked();
  });

  test('should clear all selections', async ({ page }) => {
    // Select a few mountains
    await page.locator('[data-testid="mountain-item-everest"]').click();
    await page.locator('[data-testid="mountain-item-k2"]').click();
    
    // Handle the confirmation dialog and click clear all button
    page.on('dialog', dialog => dialog.accept());
    await page.locator('[data-testid="clear-all-button"]').click();
    
    // Wait for state to update
    await page.waitForTimeout(500);
    
    // Check that no mountains are selected
    const checkboxes = page.locator('[data-testid^="mountain-item-"] input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).not.toBeChecked();
    }
    
    // Check that comparison view shows empty state
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });

  test('should display mountain information correctly', async ({ page }) => {
    // Select a mountain
    await page.locator('[data-testid="mountain-item-everest"]').click();
    
    // Check that triangle displays mountain name and dimensions
    const triangle = page.locator('[data-testid="triangle-everest"]');
    await expect(triangle.locator('[data-testid="mountain-name"]')).toContainText('Mount Everest');
    await expect(triangle.locator('[data-testid="mountain-height"]')).toContainText('8,849');
    await expect(triangle.locator('[data-testid="mountain-width"]')).toContainText('5,000');
  });
});