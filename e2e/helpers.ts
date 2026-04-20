import { Page, expect } from '@playwright/test';

export const ADMIN = { email: 'admin@system.com', password: 'admin123' };

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByLabel(/البريد الإلكتروني/).fill(email);
  await page.getByLabel(/كلمة المرور/).first().fill(password);
  await page.getByRole('button', { name: /تسجيل الدخول/ }).click();
  await page.waitForLoadState('networkidle');
}

export async function loginAsAdmin(page: Page) {
  await login(page, ADMIN.email, ADMIN.password);
  // بعد Login، الأدمن يُوجَّه لـ /admin/stats → يظهر "الإحصائيات" كـ PageHeader
  await expect(page.locator('h1', { hasText: /الإحصائيات/ })).toBeVisible({ timeout: 10000 });
}

/**
 * Logout: يفتح dropdown الـ avatar ثم يضغط "تسجيل الخروج".
 */
export async function logout(page: Page) {
  // الـ avatar button في الـ topbar: أول button بعد bell يحتوي على initials
  const avatarButton = page.locator('header button').filter({ has: page.locator('.size-8') }).first();
  await avatarButton.click();
  await page.getByRole('menuitem', { name: /تسجيل الخروج/ }).click();
  await expect(page.getByRole('button', { name: /تسجيل الدخول/ })).toBeVisible({ timeout: 10000 });
}

export async function apiCreateUser(
  adminToken: string,
  email: string,
  password: string,
  userType: 'institution' | 'warehouse' | 'admin',
  extra?: { institutionId?: number; warehouseId?: number }
) {
  const res = await fetch('http://localhost:3002/api/v1/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ email, password, userType, ...extra }),
  });
  const d = await res.json();
  return d.success ? d.data : null;
}

export async function apiLogin(email: string, password: string): Promise<string | null> {
  const res = await fetch('http://localhost:3002/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const d = await res.json();
  return d.success ? d.data.token : null;
}

export async function findFreePair(adminToken: string) {
  const [iRes, wRes] = await Promise.all([
    fetch('http://localhost:3002/api/v1/admin/institutions', { headers: { Authorization: `Bearer ${adminToken}` } }).then(r => r.json()),
    fetch('http://localhost:3002/api/v1/admin/warehouses', { headers: { Authorization: `Bearer ${adminToken}` } }).then(r => r.json()),
  ]);
  for (const i of iRes.data) {
    if (i.hasAccount) continue;
    const w = wRes.data.find((w: any) => !w.hasAccount && w.governorate === i.governorate);
    if (w) return { inst: i, wh: w };
  }
  return null;
}

export async function cleanupTestUsers(adminToken: string, emails: string[]) {
  const res = await fetch('http://localhost:3002/api/v1/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const d = await res.json();
  const users = Array.isArray(d.data) ? d.data : (d.data?.data ?? []);
  for (const u of users) {
    if (emails.includes(u.email)) {
      await fetch(`http://localhost:3002/api/v1/admin/users/${u.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
  }
}

/**
 * يضغط على رابط sidebar بالاسم الدقيق (Shadcn sidebar menu-button).
 */
export async function clickSidebarLink(page: Page, label: string) {
  const link = page.locator('[data-sidebar="menu-button"]').filter({ hasText: new RegExp(`^${label}$`) }).first();
  await link.click();
}
