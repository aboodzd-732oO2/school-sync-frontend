import { test, expect } from '@playwright/test';
import { loginAsAdmin, logout, login, apiLogin, apiCreateUser, cleanupTestUsers, ADMIN } from './helpers';

const TEST_ADMIN_EMAIL = 'e2e-auth-admin@test.com';
const TEST_ADMIN_INITIAL_PASS = 'TestInit1';

test.describe('Auth flow', () => {
  test.beforeAll(async () => {
    const token = await apiLogin(ADMIN.email, ADMIN.password);
    if (!token) throw new Error('admin login failed');
    await cleanupTestUsers(token, [TEST_ADMIN_EMAIL]);
    await apiCreateUser(token, TEST_ADMIN_EMAIL, TEST_ADMIN_INITIAL_PASS, 'admin');
  });
  test.afterAll(async () => {
    const token = await apiLogin(ADMIN.email, ADMIN.password);
    if (token) await cleanupTestUsers(token, [TEST_ADMIN_EMAIL]);
  });

  test('صفحة الدخول تظهر بالحقول المطلوبة', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel(/البريد الإلكتروني/)).toBeVisible();
    await expect(page.getByLabel(/كلمة المرور/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /تسجيل الدخول/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /نسيت كلمة المرور/ })).toBeVisible();
  });

  test('admin يسجل دخول ويصل إلى لوحة التحكم', async ({ page }) => {
    await loginAsAdmin(page);
    // PageHeader يعرض "الإحصائيات" + email في avatar dropdown
    await expect(page.locator('h1', { hasText: /الإحصائيات/ })).toBeVisible();
  });

  test('تسجيل دخول فاشل يعرض رسالة خطأ', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/البريد الإلكتروني/).fill('admin@system.com');
    await page.getByLabel(/كلمة المرور/).first().fill('wrong-password');
    await page.getByRole('button', { name: /تسجيل الدخول/ }).click();
    await expect(page.getByText(/فشل تسجيل الدخول|غير صحيحة/).first()).toBeVisible({ timeout: 10000 });
  });

  test('زر نسيت كلمة المرور يفتح الـ modal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /نسيت كلمة المرور/ }).click();
    await expect(page.getByRole('dialog').getByText(/استعادة كلمة المرور/)).toBeVisible();
    // إرسال الطلب — نستخدم input الوحيد داخل الـ dialog
    await page.getByRole('dialog').locator('input[type="email"]').fill('someone@test.com');
    await page.getByRole('button', { name: /إرسال الطلب/ }).click();
    await expect(page.getByText(/تم إرسال طلبك|يرجى التواصل/).first()).toBeVisible({ timeout: 10000 });
  });

  test('tab لـ logout يرجع للصفحة الأولى', async ({ page }) => {
    await loginAsAdmin(page);
    await logout(page);
    await expect(page.getByRole('button', { name: /تسجيل الدخول/ })).toBeVisible();
  });

  test('admin يقدر يغيّر كلمة مروره + تسجيل دخول بالجديدة', async ({ page }) => {
    // يستخدم test-admin المعزول (ليس admin@system)
    await login(page, TEST_ADMIN_EMAIL, TEST_ADMIN_INITIAL_PASS);
    await expect(page.locator('h1', { hasText: /الإحصائيات/ })).toBeVisible({ timeout: 10000 });

    // تغيير كلمة المرور الآن عبر avatar dropdown
    const avatarButton = page.locator('header button').filter({ has: page.locator('.size-8') }).first();
    await avatarButton.click();
    await page.getByRole('menuitem', { name: /تغيير كلمة المرور/ }).click();
    const inputs = page.getByRole('dialog').locator('input[type="password"]');
    await inputs.nth(0).fill(TEST_ADMIN_INITIAL_PASS);
    await inputs.nth(1).fill('NewPass99');
    await inputs.nth(2).fill('NewPass99');
    await page.getByRole('button', { name: /^تغيير$/ }).click();
    await expect(page.getByText(/تم تغيير/).first()).toBeVisible({ timeout: 10000 });

    // logout + login بالكلمة الجديدة
    await logout(page);
    await login(page, TEST_ADMIN_EMAIL, 'NewPass99');
    await expect(page.locator('h1', { hasText: /الإحصائيات/ })).toBeVisible({ timeout: 10000 });
  });
});
