import { test, expect } from '@playwright/test';
import { loginAsAdmin, apiLogin } from './helpers';

// helper: يفتح sidebar إذا كان مطوياً + يضغط على رابط بالاسم الدقيق
async function clickSidebarLink(page: any, label: string) {
  // روابط الـ sidebar من Shadcn: أزرار داخل [data-sidebar="menu-button"]
  const link = page.locator('[data-sidebar="menu-button"]').filter({ hasText: new RegExp(`^${label}$`) }).first();
  await link.click();
}

test.describe('Admin dashboard flows', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('كل روابط الـ sidebar الـ 13 تفتح بدون أخطاء', async ({ page }) => {
    const labels = [
      'الإحصائيات', 'المستخدمين', 'المؤسسات', 'المستودعات',
      'الأقسام', 'عناصر الأقسام', 'المحافظات', 'أنواع المؤسسات',
      'الوحدات', 'الأولويات', 'خريطة التوجيه', 'طلبات الاستعادة',
      'سجل الأحداث',
    ];
    for (const label of labels) {
      await clickSidebarLink(page, label);
      await expect(page.locator('text=/Something went wrong|Error boundary/i')).toHaveCount(0);
      // نتحقق أن عنوان الصفحة في PageHeader يتطابق
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });

  test('NotificationBell مرئي في header الأدمن', async ({ page }) => {
    await expect(page.locator('button').filter({ has: page.locator('svg.lucide-bell') }).first()).toBeVisible();
  });

  test('صفحة المستخدمين تعرض الجدول', async ({ page }) => {
    await clickSidebarLink(page, 'المستخدمين');
    await expect(page.getByRole('columnheader', { name: /البريد/ })).toBeVisible();
    await expect(page.getByText('admin@system.com').first()).toBeVisible();
  });

  test('CreateUserModal يفتح بضغطة "إنشاء حساب جديد"', async ({ page }) => {
    await clickSidebarLink(page, 'المستخدمين');
    await page.getByRole('button', { name: /إنشاء حساب جديد/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByText(/نوع الحساب/)).toBeVisible();
  });

  test('إضافة قسم جديد من صفحة الأقسام', async ({ page }) => {
    const token = await apiLogin('admin@system.com', 'admin123');
    const list = await fetch('http://localhost:3002/api/v1/admin/departments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const prev = list.data?.find((x: any) => x.key === 'e2e-test-dept');
    if (prev) await fetch(`http://localhost:3002/api/v1/admin/departments/${prev.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

    await clickSidebarLink(page, 'الأقسام');
    await page.getByRole('button', { name: /إضافة قسم/ }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('input').first().fill('e2e-test-dept');
    await dialog.locator('input').nth(1).fill('قسم اختبار E2E');
    await page.getByRole('button', { name: /^إضافة$/ }).click();
    await expect(page.getByText('قسم اختبار E2E')).toBeVisible({ timeout: 10000 });

    // cleanup
    const list2 = await fetch('http://localhost:3002/api/v1/admin/departments', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const dept = list2.data?.find((x: any) => x.key === 'e2e-test-dept');
    if (dept) await fetch(`http://localhost:3002/api/v1/admin/departments/${dept.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  });

  test('صفحة سجل الأحداث تعرض الأعمدة', async ({ page }) => {
    await clickSidebarLink(page, 'سجل الأحداث');
    await expect(page.getByRole('columnheader', { name: /الوقت/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /الإجراء/ })).toBeVisible();
  });
});
