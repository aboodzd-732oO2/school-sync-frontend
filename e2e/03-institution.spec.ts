import { test, expect } from '@playwright/test';
import { apiLogin, apiCreateUser, findFreePair, cleanupTestUsers, login, clickSidebarLink } from './helpers';

const EMAIL = 'e2e-inst@test.com';
const PASSWORD = 'E2eInst1';

test.describe('Institution workflows', () => {
  test.beforeAll(async () => {
    const adminToken = await apiLogin('admin@system.com', 'admin123');
    if (!adminToken) throw new Error('admin login failed');
    await cleanupTestUsers(adminToken, [EMAIL]);
    const pair = await findFreePair(adminToken);
    if (!pair) throw new Error('no free inst/wh pair');
    await apiCreateUser(adminToken, EMAIL, PASSWORD, 'institution', { institutionId: pair.inst.id });
  });

  test.afterAll(async () => {
    const adminToken = await apiLogin('admin@system.com', 'admin123');
    if (adminToken) await cleanupTestUsers(adminToken, [EMAIL]);
  });

  test.beforeEach(async ({ page }) => {
    await login(page, EMAIL, PASSWORD);
  });

  test('المؤسسة تسجل دخول بنجاح وترى الـ Shell', async ({ page }) => {
    // sidebar يعرض "نظام إدارة الطلبات"
    await expect(page.getByText(/نظام إدارة الطلبات/).first()).toBeVisible({ timeout: 10000 });
  });

  test('NotificationBell مرئي في header', async ({ page }) => {
    await expect(page.locator('button').filter({ has: page.locator('svg.lucide-bell') }).first()).toBeVisible({ timeout: 10000 });
  });

  test('رابط التقارير يفتح صفحة التقارير', async ({ page }) => {
    await clickSidebarLink(page, 'التقارير');
    await expect(page.locator('text=/Error|Something went wrong/i')).toHaveCount(0);
  });

  test('رابط طلب جديد يفتح نموذج الطلب', async ({ page }) => {
    await clickSidebarLink(page, 'طلب جديد');
    await expect(page.locator('input, textarea, select').first()).toBeVisible({ timeout: 10000 });
  });
});
