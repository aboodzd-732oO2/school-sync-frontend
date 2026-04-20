import { test } from '@playwright/test';
import { loginAsAdmin, clickSidebarLink } from './helpers';

test.describe('Visual screenshots — Phase 5 inspection', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  const pages = [
    { label: 'الإحصائيات', file: 'admin-stats' },
    { label: 'المستخدمين', file: 'admin-users' },
    { label: 'المؤسسات', file: 'admin-institutions' },
    { label: 'المستودعات', file: 'admin-warehouses' },
    { label: 'الأقسام', file: 'admin-departments' },
    { label: 'عناصر الأقسام', file: 'admin-dept-items' },
    { label: 'المحافظات', file: 'admin-governorates' },
    { label: 'أنواع المؤسسات', file: 'admin-inst-types' },
    { label: 'الوحدات', file: 'admin-units' },
    { label: 'الأولويات', file: 'admin-priorities' },
    { label: 'خريطة التوجيه', file: 'admin-routing' },
    { label: 'طلبات الاستعادة', file: 'admin-password-resets' },
    { label: 'سجل الأحداث', file: 'admin-audit' },
  ];

  for (const p of pages) {
    test(`screenshot: ${p.label}`, async ({ page }) => {
      await clickSidebarLink(page, p.label);
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `test-results/screenshots/${p.file}.png`,
        fullPage: true,
      });
    });
  }
});
