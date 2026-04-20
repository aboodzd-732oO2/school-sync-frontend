import { test, expect, Browser } from '@playwright/test';
import { apiLogin, apiCreateUser, findFreePair, cleanupTestUsers, login } from './helpers';

const INST_EMAIL = 'e2e-rt-inst@test.com';
const WH_EMAIL = 'e2e-rt-wh@test.com';
const PASS = 'RealTime1';

let instId: number, whId: number, whDept: string;

test.describe('Real-time cross-tab updates', () => {
  test.beforeAll(async () => {
    const adminToken = await apiLogin('admin@system.com', 'admin123');
    if (!adminToken) throw new Error('admin login failed');
    await cleanupTestUsers(adminToken, [INST_EMAIL, WH_EMAIL]);
    const pair = await findFreePair(adminToken);
    if (!pair) throw new Error('no free pair');
    instId = pair.inst.id; whId = pair.wh.id; whDept = pair.wh.departmentKey;
    await apiCreateUser(adminToken, INST_EMAIL, PASS, 'institution', { institutionId: instId });
    await apiCreateUser(adminToken, WH_EMAIL, PASS, 'warehouse', { warehouseId: whId });
  });

  test.afterAll(async () => {
    const adminToken = await apiLogin('admin@system.com', 'admin123');
    if (adminToken) await cleanupTestUsers(adminToken, [INST_EMAIL, WH_EMAIL]);
  });

  test('المؤسسة تنشئ طلب → جرس المستودع يرتفع فوراً', async ({ browser }: { browser: Browser }) => {
    const instCtx = await browser.newContext();
    const whCtx = await browser.newContext();
    const instPage = await instCtx.newPage();
    const whPage = await whCtx.newPage();

    await login(instPage, INST_EMAIL, PASS);
    await login(whPage, WH_EMAIL, PASS);

    // نقرأ عدد الإشعارات في المستودع قبل
    const bell = whPage.locator('button').filter({ has: whPage.locator('svg.lucide-bell') }).first();
    await expect(bell).toBeVisible({ timeout: 10000 });

    // المؤسسة تنشئ طلب عبر API (أسرع وأقل هشاشة من UI)
    const instToken = await apiLogin(INST_EMAIL, PASS);
    await fetch('http://localhost:3002/api/v1/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${instToken}` },
      body: JSON.stringify({
        title: 'E2E real-time',
        description: 'اختبار الـ real-time',
        priority: 'high', status: 'pending', quantity: 1, studentsAffected: 0,
        unitType: 'قطعة', subcategory: 'e2e', departmentKey: whDept,
      }),
    });

    // ننتظر أن يظهر badge unread على الجرس (real-time)
    await expect(whPage.locator('button').filter({ has: whPage.locator('svg.lucide-bell') }).first().locator('text=/[1-9]/')).toBeVisible({ timeout: 6000 });

    await instCtx.close();
    await whCtx.close();
  });
});
