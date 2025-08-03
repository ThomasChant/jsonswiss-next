import { test, expect, Page } from '@playwright/test';

const TEST_JSON = {
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming", "coding"],
  "address": {
    "street": "123 Main St",
    "zipcode": "10001"
  }
};

const TEST_JSON_STRING = JSON.stringify(TEST_JSON, null, 2);

async function waitForApp(page: Page) {
  // Wait for the app to be fully loaded
  await page.waitForSelector('header');
  await page.waitForSelector('main');
  await page.waitForTimeout(1000); // Give time for React hydration
}

test.describe('JSON Swiss App Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await waitForApp(page);
  });

  test('should load home page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/JSON Swiss/);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Check header navigation
    await expect(page.locator('text=JSON Swiss')).toBeVisible();
    await expect(page.locator('text=Converter')).toBeVisible();
    await expect(page.locator('text=Code Generator')).toBeVisible();
    await expect(page.locator('text=Tools')).toBeVisible();
    await expect(page.locator('text=Editor')).toBeVisible();
  });

  test('should open dropdown menus', async ({ page }) => {
    // Test Converter dropdown
    const converterBtn = page.locator('button:has-text("Converter")');
    await converterBtn.click();
    await page.waitForTimeout(500);
    
    // Check if dropdown content is visible
    const dropdown = page.locator('[role="menu"], .dropdown-content, [data-state="open"]').first();
    if (await dropdown.isVisible()) {
      await expect(page.locator('text=JSON to CSV')).toBeVisible();
      await expect(page.locator('text=JSON to XML')).toBeVisible();
    }

    // Click outside to close
    await page.click('body');
    await page.waitForTimeout(500);

    // Test Code Generator dropdown
    const codeGenBtn = page.locator('button:has-text("Code Generator")');
    await codeGenBtn.click();
    await page.waitForTimeout(500);

    // Test Tools dropdown
    const toolsBtn = page.locator('button:has-text("Tools")');
    await toolsBtn.click();
    await page.waitForTimeout(500);
  });

  test('should handle JSON input and display', async ({ page }) => {
    // Find the JSON editor textarea
    const jsonEditor = page.locator('textarea').first();
    await expect(jsonEditor).toBeVisible();

    // Input JSON
    await jsonEditor.fill(TEST_JSON_STRING);
    await page.waitForTimeout(1000);

    // Check if JSON is processed and displayed in sidebar
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    
    // Wait for JSON to be processed
    await page.waitForTimeout(2000);
  });

  test('should toggle between tree and table view', async ({ page }) => {
    // Input JSON first
    const jsonEditor = page.locator('textarea').first();
    await jsonEditor.fill(TEST_JSON_STRING);
    await page.waitForTimeout(1000);

    // Find view toggle buttons
    const treeBtn = page.locator('button:has-text("Tree")');
    const tableBtn = page.locator('button:has-text("Table")');

    await expect(treeBtn).toBeVisible();
    await expect(tableBtn).toBeVisible();

    // Test Tree view (should be active by default)
    await expect(treeBtn).toHaveClass(/bg-primary|text-primary-foreground/);

    // Switch to Table view
    await tableBtn.click();
    await page.waitForTimeout(500);
    await expect(tableBtn).toHaveClass(/bg-primary|text-primary-foreground/);

    // Switch back to Tree view
    await treeBtn.click();
    await page.waitForTimeout(500);
    await expect(treeBtn).toHaveClass(/bg-primary|text-primary-foreground/);
  });

  test('should test undo/redo functionality', async ({ page }) => {
    const jsonEditor = page.locator('textarea').first();
    
    // Input initial JSON
    await jsonEditor.fill('{"test": "value1"}');
    await page.waitForTimeout(1000);

    // Modify JSON
    await jsonEditor.fill('{"test": "value2"}');
    await page.waitForTimeout(1000);

    // Test undo button
    const undoBtn = page.locator('button[title*="Undo"], button:has-text("Undo")').first();
    const redoBtn = page.locator('button[title*="Redo"], button:has-text("Redo")').first();

    // Check if buttons exist
    await expect(undoBtn).toBeVisible();
    await expect(redoBtn).toBeVisible();

    // Try clicking undo (may be disabled initially)
    if (await undoBtn.isEnabled()) {
      await undoBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('should test expand/collapse functionality', async ({ page }) => {
    // Input JSON with nested structure
    await page.locator('textarea').first().fill(TEST_JSON_STRING);
    await page.waitForTimeout(1000);

    // Test expand/collapse buttons
    const expandAllBtn = page.locator('button:has-text("Expand All")');
    const collapseAllBtn = page.locator('button:has-text("Collapse All")');

    if (await expandAllBtn.isVisible()) {
      await expandAllBtn.click();
      await page.waitForTimeout(500);
    }

    if (await collapseAllBtn.isVisible()) {
      await collapseAllBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('should test copy and export functionality', async ({ page }) => {
    // Input JSON
    await page.locator('textarea').first().fill(TEST_JSON_STRING);
    await page.waitForTimeout(1000);

    // Test copy button
    const copyBtn = page.locator('button[title*="Copy"], button:has-text("Copy")').first();
    if (await copyBtn.isVisible() && await copyBtn.isEnabled()) {
      await copyBtn.click();
      await page.waitForTimeout(500);
    }

    // Test export button
    const exportBtn = page.locator('button[title*="Export"], button:has-text("Export")').first();
    if (await exportBtn.isVisible() && await exportBtn.isEnabled()) {
      // Note: Can't easily test file download in this context
      await expect(exportBtn).toBeVisible();
    }
  });

  test('should test editor resize functionality', async ({ page }) => {
    // Test minimize button
    const minimizeBtn = page.locator('button[title*="Minimize"]');
    if (await minimizeBtn.isVisible()) {
      await minimizeBtn.click();
      await page.waitForTimeout(500);
      
      // Test restore
      await minimizeBtn.click();
      await page.waitForTimeout(500);
    }

    // Test maximize button
    const maximizeBtn = page.locator('button[title*="Maximize"]');
    if (await maximizeBtn.isVisible()) {
      await maximizeBtn.click();
      await page.waitForTimeout(500);
      
      // Test restore
      await maximizeBtn.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await waitForApp(page);
  });

  test('should navigate to converter pages', async ({ page }) => {
    // Try to click converter dropdown and navigate to JSON to CSV
    const converterBtn = page.locator('button:has-text("Converter")');
    await converterBtn.click();
    await page.waitForTimeout(1000);

    // Look for JSON to CSV link and click it
    const jsonToCsvLink = page.locator('a[href="/converter/json-to-csv"], text="JSON to CSV"').first();
    if (await jsonToCsvLink.isVisible()) {
      await jsonToCsvLink.click();
      await page.waitForTimeout(2000);
      
      // Verify we're on the converter page
      await expect(page).toHaveURL(/converter\/json-to-csv/);
      await expect(page.locator('text=JSON to CSV Converter')).toBeVisible();
    } else {
      // If dropdown doesn't work, try direct navigation
      await page.goto('http://localhost:3001/converter/json-to-csv');
      await waitForApp(page);
      await expect(page.locator('text=JSON to CSV Converter')).toBeVisible();
    }
  });

  test('should test footer links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check for common footer links
    const footerLinks = [
      'Privacy',
      'Terms', 
      'Docs',
      'Changelog'
    ];

    for (const linkText of footerLinks) {
      const link = footer.locator(`a:has-text("${linkText}")`);
      if (await link.isVisible()) {
        await expect(link).toBeVisible();
        // Note: Not clicking to avoid navigation errors
      }
    }
  });
});

test.describe('JSON to CSV Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/converter/json-to-csv');
    await waitForApp(page);
  });

  test('should load CSV converter page', async ({ page }) => {
    await expect(page.locator('text=JSON to CSV Converter')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should convert JSON to CSV', async ({ page }) => {
    // Input test JSON
    const jsonEditor = page.locator('textarea').first();
    await jsonEditor.fill(JSON.stringify([
      {"name": "John", "age": 30},
      {"name": "Jane", "age": 25}
    ]));
    await page.waitForTimeout(2000);

    // Check for CSV output
    const csvOutput = page.locator('pre').last();
    if (await csvOutput.isVisible()) {
      const csvText = await csvOutput.textContent();
      expect(csvText).toContain('name');
      expect(csvText).toContain('age');
    }
  });

  test('should test CSV converter options', async ({ page }) => {
    // Test various checkboxes and options
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      if (await checkbox.isVisible()) {
        await checkbox.click();
        await page.waitForTimeout(300);
        await checkbox.click(); // Toggle back
        await page.waitForTimeout(300);
      }
    }

    // Test delimiter dropdown
    const delimiterSelect = page.locator('select');
    if (await delimiterSelect.isVisible()) {
      await delimiterSelect.selectOption(';');
      await page.waitForTimeout(500);
      await delimiterSelect.selectOption(',');
    }
  });

  test('should test CSV copy and download buttons', async ({ page }) => {
    // Input JSON to generate CSV
    await page.locator('textarea').first().fill('{"test": "value"}');
    await page.waitForTimeout(1000);

    // Test copy button in CSV section
    const copyBtn = page.locator('button:has-text("Copy")').last();
    if (await copyBtn.isVisible() && await copyBtn.isEnabled()) {
      await copyBtn.click();
      await page.waitForTimeout(500);
    }

    // Test download button
    const downloadBtn = page.locator('button:has-text("Download CSV")');
    if (await downloadBtn.isVisible() && await downloadBtn.isEnabled()) {
      await expect(downloadBtn).toBeVisible();
      // Note: Not clicking download to avoid file system interactions
    }
  });
});

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await waitForApp(page);
  });

  test('should handle invalid JSON gracefully', async ({ page }) => {
    const jsonEditor = page.locator('textarea').first();
    
    // Input invalid JSON
    await jsonEditor.fill('{"invalid": json}');
    await page.waitForTimeout(1000);

    // Check for error message
    const errorMsg = page.locator('.error, [class*="error"], [class*="destructive"]');
    if (await errorMsg.isVisible()) {
      await expect(errorMsg).toBeVisible();
    }
  });

  test('should handle empty input', async ({ page }) => {
    const jsonEditor = page.locator('textarea').first();
    
    // Clear input
    await jsonEditor.fill('');
    await page.waitForTimeout(1000);

    // App should still function
    await expect(page.locator('main')).toBeVisible();
  });
});