import { test, expect } from '@playwright/test';
import { apiLogin, apiCreateUser, findFreePair, cleanupTestUsers, login } from './helpers';

const INST_EMAIL = 'e2e-inst2@test.com';
const WH_EMAIL = 'e2e-wh2@test.com';
const PASS = 'E2eTest1';

let whDept: string;

test.describe('Warehouse workflows', () => {
  test.beforeAll(async () => {
    const adminToken = await apiLogin('admin@system.com', 'admin123');
    if (!adminToken) throw new Error('admin login failed');
    await cleanupTestUsers(adminToken, [INST_EMAIL, WH_EMAIL]);
    const pair = await findFreePair(adminToken);
    if (!pair) throw new Error('no free inst/wh pair');
    whDept = pair.wh.departmentKey;
    await apiCreateUser(adminToken, INST_EMAIL, PASS, 'institution', { institutionId: pair.inst.id });
    await apiCreateUser(adminToken, WH_EMAIL, PASS, 'warehouse', { warehouseId: pair.wh.id });

    // المؤسسة تنشئ طلباً عبر API (setup)
    const instToken = await apiLogin(INST_EMAIL, PASS);
    await fetch('http://localhost:3002/api/v1/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instToken}` },
      body: JSON.stringify({
        title: 'E2E طلب للمستودع',
        description: 'اختبار المستودع',
        priority: 'high', status: 'pending', quantity: 1, studentsAffected: 0,
        unitType: 'قطعة', subcategory: 'e2e-item', departmentKey: whDept,
      }),
    });
  });

  test.afterAll(async () => {
    const adminToken = await apiLogin('admin@system.com', 'admin123');
    if (adminToken) await cleanupTestUsers(adminToken, [INST_EMAIL, WH_EMAIL]);
  });

  test.beforeEach(async ({ page }) => {
    await login(page, WH_EMAIL, PASS);
  });

  test('WarehouseDashboard يُرندر ويعرض الطلب', async ({ page }) => {
    await expect(page.locator('body')).toContainText(/E2E طلب للمستودع/i, { timeout: 15000 });
  });

  test('NotificationBell موجود في navigation', async ({ page }) => {
    await expect(page.locator('button').filter({ has: page.locator('svg.lucide-bell') }).first()).toBeVisible({ timeout: 10000 });
  });

  test('screenshot: warehouse dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('body')).toContainText(/E2E طلب للمستودع/i, { timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'test-results/screenshots/warehouse-dashboard.png',
    });
  });

  test('screenshot: warehouse request card detail', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await expect(page.locator('body')).toContainText(/E2E طلب للمستودع/i, { timeout: 15000 });
    await page.waitForTimeout(500);
    // Scroll to requests list
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(300);
    await page.screenshot({
      path: 'test-results/screenshots/warehouse-request-card.png',
    });
  });

  test('screenshot: warehouse inventory tab', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('body')).toContainText(/E2E طلب للمستودع/i, { timeout: 15000 });
    await page.getByRole('tab', { name: /إدارة المخزون/ }).click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'test-results/screenshots/warehouse-inventory.png',
    });
  });
});
