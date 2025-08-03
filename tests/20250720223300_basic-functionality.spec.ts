import { test, expect, Page } from '@playwright/test';

const TEST_JSON = {
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming", "coding"]
};

const TEST_JSON_STRING = JSON.stringify(TEST_JSON, null, 2);

async function waitForApp(page: Page) {
  await page.waitForSelector('header');
  await page.waitForSelector('main');
  await page.waitForTimeout(500);
}

test.describe('Basic Functionality Tests', () => {
  test('should load home page and basic elements', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await waitForApp(page);
    
    // Check title
    await expect(page).toHaveTitle(/JSON Swiss/);
    
    // Check main elements are visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    
    // Check navigation elements
    await expect(page.locator('header').locator('text=JSON Swiss').first()).toBeVisible();
    await expect(page.locator('text=Converter').first()).toBeVisible();
    await expect(page.locator('text=Code Generator').first()).toBeVisible();
    await expect(page.locator('text=Tools').first()).toBeVisible();
  });

  test('should handle JSON input', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await waitForApp(page);
    
    // Find JSON editor
    const jsonEditor = page.locator('textarea').first();
    await expect(jsonEditor).toBeVisible();
    
    // Input JSON
    await jsonEditor.fill(TEST_JSON_STRING);
    await page.waitForTimeout(1000);
    
    // Verify input was accepted
    const editorValue = await jsonEditor.inputValue();
    expect(editorValue).toContain('"name": "John Doe"');
  });

  test('should toggle view modes', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await waitForApp(page);
    
    // Input JSON first
    await page.locator('textarea').first().fill(TEST_JSON_STRING);
    await page.waitForTimeout(500);
    
    // Test view toggle buttons
    const treeBtn = page.locator('button').filter({ hasText: 'Tree' });
    const tableBtn = page.locator('button').filter({ hasText: 'Table' });
    
    await expect(treeBtn).toBeVisible();
    await expect(tableBtn).toBeVisible();
    
    // Switch to table view
    await tableBtn.click();
    await page.waitForTimeout(500);
    
    // Switch back to tree view
    await treeBtn.click();
    await page.waitForTimeout(500);
  });

  test('should test basic button functionality', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await waitForApp(page);
    
    // Input JSON
    await page.locator('textarea').first().fill(TEST_JSON_STRING);
    await page.waitForTimeout(1000);
    
    // Test expand/collapse buttons
    const expandBtn = page.locator('button:has-text("Expand All")');
    const collapseBtn = page.locator('button:has-text("Collapse All")');
    
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
      await page.waitForTimeout(300);
    }
    
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('should test dropdown navigation', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await waitForApp(page);
    
    // Test converter dropdown
    const converterBtn = page.locator('button:has-text("Converter")');
    await converterBtn.click();
    await page.waitForTimeout(1000);
    
    // Look for dropdown items
    const jsonToCsvItem = page.locator('text=JSON to CSV').first();
    if (await jsonToCsvItem.isVisible()) {
      await jsonToCsvItem.click();
      await page.waitForTimeout(1000);
      
      // Should navigate to converter page
      await expect(page.url()).toContain('converter/json-to-csv');
    }
  });

  test('should load converter page', async ({ page }) => {
    await page.goto('http://localhost:3001/converter/json-to-csv');
    await waitForApp(page);
    
    // Check page loaded correctly
    await expect(page.locator('text=JSON to CSV Converter')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should load other tool pages', async ({ page }) => {
    const pages = [
      '/formatter',
      '/validator', 
      '/schema',
      '/repair',
      '/generator/typescript',
      '/generator/python',
      '/generator/javascript'
    ];
    
    for (const url of pages) {
      await page.goto(`http://localhost:3001${url}`);
      await waitForApp(page);
      
      // Should load without error
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('should handle editor resize', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await waitForApp(page);
    
    // Find resize buttons by title
    const minimizeBtn = page.locator('button[title*="Minimize"]');
    const maximizeBtn = page.locator('button[title*="Maximize"]');
    
    if (await minimizeBtn.isVisible()) {
      await minimizeBtn.click();
      await page.waitForTimeout(300);
      
      // Click again to restore
      await minimizeBtn.click();
      await page.waitForTimeout(300);
    }
    
    if (await maximizeBtn.isVisible()) {
      await maximizeBtn.click();
      await page.waitForTimeout(300);
      
      // Click again to restore
      await maximizeBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('should test CSV converter functionality', async ({ page }) => {
    await page.goto('http://localhost:3001/converter/json-to-csv');
    await waitForApp(page);
    
    // Input JSON array for CSV conversion
    const testArray = [
      {"name": "John", "age": 30},
      {"name": "Jane", "age": 25}
    ];
    
    await page.locator('textarea').first().fill(JSON.stringify(testArray));
    await page.waitForTimeout(2000);
    
    // Should have CSV output area
    const csvOutput = page.locator('pre').last();
    if (await csvOutput.isVisible()) {
      // Should contain CSV-like content
      const content = await csvOutput.textContent();
      // Basic check - could contain headers or data
      expect(content?.length).toBeGreaterThan(0);
    }
    
    // Test CSV options
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    // Toggle each checkbox
    for (let i = 0; i < Math.min(count, 3); i++) {
      const checkbox = checkboxes.nth(i);
      if (await checkbox.isVisible()) {
        await checkbox.click();
        await page.waitForTimeout(200);
      }
    }
  });
});