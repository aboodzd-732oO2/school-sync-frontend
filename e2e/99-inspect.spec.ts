import { test } from '@playwright/test';
import { loginAsAdmin, clickSidebarLink } from './helpers';

test('screenshot: admin departments + create form open', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await loginAsAdmin(page);
  await clickSidebarLink(page, 'الأقسام');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/screenshots/inspect-admin-departments-list.png' });

  await page.getByRole('button', { name: /إضافة قسم/ }).first().click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/screenshots/inspect-admin-departments-create.png' });
});
