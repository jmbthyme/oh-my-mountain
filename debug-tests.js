// Simple debug script to test if the application is working
import { chromium } from 'playwright';

async function debugTests() {
  console.log('Starting debug tests...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to application...');
    await page.goto('http://localhost:4173');
    
    console.log('Waiting for mountain list...');
    await page.waitForSelector('[data-testid="mountain-list"]', { timeout: 10000 });
    console.log('✓ Mountain list found');
    
    console.log('Checking for mountain items...');
    const mountainItems = await page.locator('[data-testid^="mountain-item-"]').count();
    console.log(`✓ Found ${mountainItems} mountain items`);
    
    console.log('Testing mountain selection...');
    await page.locator('[data-testid="mountain-item-everest"]').click();
    console.log('✓ Clicked on Everest');
    
    console.log('Waiting for triangle to appear...');
    await page.waitForSelector('[data-testid="triangle-everest"]', { timeout: 5000 });
    console.log('✓ Triangle appeared');
    
    console.log('All basic tests passed!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-screenshot.png' });
    console.log('Screenshot saved as debug-screenshot.png');
  } finally {
    await browser.close();
  }
}

debugTests();