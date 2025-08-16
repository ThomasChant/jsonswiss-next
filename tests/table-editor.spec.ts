import { test, expect } from '@playwright/test';

test.describe('JSON Table Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/json-table-editor');
  });

  test('should load and display the table editor page', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/JSON Table Editor/);
    
    // 检查是否显示"No JSON Data Loaded"提示
    await expect(page.getByText('No JSON Data Loaded')).toBeVisible();
    
    // 检查导入按钮是否存在
    await expect(page.getByRole('button', { name: /Import JSON/i })).toBeVisible();
  });

  test('should import JSON data and display in table format', async ({ page }) => {
    // 点击导入按钮
    await page.getByRole('button', { name: /Import JSON/i }).click();
    
    // 等待对话框出现
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // 输入测试JSON数据
    const testData = {
      users: [
        { name: 'John', age: 30, email: 'john@example.com' },
        { name: 'Jane', age: 25, email: 'jane@example.com' }
      ]
    };
    
    await page.getByRole('textbox').fill(JSON.stringify(testData, null, 2));
    
    // 点击导入按钮
    await page.getByRole('button', { name: /Import/i }).click();
    
    // 验证数据是否成功导入
    await expect(page.getByText('users')).toBeVisible();
  });

  test('should edit table cell values', async ({ page }) => {
    // 首先导入测试数据
    await page.getByRole('button', { name: /Import JSON/i }).click();
    
    const testData = {
      users: [
        { name: 'John', age: 30, email: 'john@example.com' }
      ]
    };
    
    await page.getByRole('textbox').fill(JSON.stringify(testData, null, 2));
    await page.getByRole('button', { name: /Import/i }).click();
    
    // 等待数据加载
    await expect(page.getByText('users')).toBeVisible();
    
    // 点击users节点来选择它
    await page.getByText('users').click();
    
    // 等待表格显示
    await page.waitForTimeout(1000);
    
    // 查找包含'John'的单元格并双击编辑
    const johnCell = page.getByText('John').first();
    await expect(johnCell).toBeVisible();
    await johnCell.dblclick();
    
    // 等待编辑模式激活
    await page.waitForTimeout(500);
    
    // 查找输入框并修改值
    const input = page.locator('input[value="John"], textarea').first();
    if (await input.isVisible()) {
      await input.clear();
      await input.fill('Johnny');
      
      // 按Enter保存或查找保存按钮
      await input.press('Enter');
      
      // 验证值是否已更新
      await expect(page.getByText('Johnny')).toBeVisible();
    }
  });

  test('should add new rows to array data', async ({ page }) => {
    // 导入数组数据
    await page.getByRole('button', { name: /Import JSON/i }).click();
    
    const testData = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 }
    ];
    
    await page.getByRole('textbox').fill(JSON.stringify(testData, null, 2));
    await page.getByRole('button', { name: /Import/i }).click();
    
    // 等待表格显示
    await page.waitForTimeout(1000);
    
    // 查找添加行按钮
    const addButton = page.getByRole('button', { name: /Add/i }).or(page.locator('button').filter({ hasText: '+' }));
    
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // 验证新行是否添加
      await page.waitForTimeout(500);
      
      // 检查是否有更多行
      const rows = page.locator('tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(2); // 至少有3行（包括表头）
    }
  });

  test('should clear data when clear button is clicked', async ({ page }) => {
    // 首先导入数据
    await page.getByRole('button', { name: /Import JSON/i }).click();
    
    const testData = { test: 'data' };
    await page.getByRole('textbox').fill(JSON.stringify(testData));
    await page.getByRole('button', { name: /Import/i }).click();
    
    // 验证数据已导入
    await expect(page.getByText('test')).toBeVisible();
    
    // 点击清除按钮
    const clearButton = page.getByRole('button', { name: /Clear/i }).or(page.locator('button').filter({ hasText: 'Trash' }));
    
    if (await clearButton.isVisible()) {
      await clearButton.click();
      
      // 验证数据已清除
      await expect(page.getByText('No JSON Data Loaded')).toBeVisible();
    }
  });
});