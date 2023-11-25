import { devices, expect, test } from '@playwright/test';

test.use({ ...devices['iPhone 14 Pro'] });

test.describe('Mobile screenshots', () => {
	test('should match Home page & navigation menu', async ({ page }) => {
		await page.goto('/');
		// Make sure gifs don't animate and cause pixel mismatches
		page.route(/ctfassets.*gif/, async (request, response) => {
			const staticImgUrl = response.url().replace(/fm=\w+/, 'fm=jpg');
			const staticResponse = await request.fetch({ url: staticImgUrl });
			return staticResponse;
		});
		const openButton = page.getByRole('button', { name: 'open navigation menu' });
		const closeButton = page.getByRole('button', { name: 'close navigation menu' });
		const menu = page.getByRole('navigation');
		await expect(page).toHaveScreenshot({
			fullPage: true,
			maxDiffPixelRatio: 0.01
		});
		await expect(menu).toBeHidden();
		await openButton.click();
		await expect(menu).toBeVisible();
		await expect(page).toHaveScreenshot({
			maxDiffPixelRatio: 0.01
		});
		await closeButton.click();
		await expect(menu).toBeHidden();
	});

	test('should match About page', async ({ page }) => {
		await page.goto('/about');
		await expect(page).toHaveScreenshot({
			maxDiffPixelRatio: 0.01
		});
	});

	test('should match Projects page', async ({ page }) => {
		await page.goto('/projects');
		// Make sure gifs don't animate and cause pixel mismatches
		page.route(/ctfassets.*gif/, async (request, response) => {
			const staticImgUrl = response.url().replace(/fm=\w+/, 'fm=jpg');
			const staticResponse = await request.fetch({ url: staticImgUrl });
			return staticResponse;
		});
		await expect(page).toHaveScreenshot({
			maxDiffPixelRatio: 0.01
		});
	});

	test('should match Photography page', async ({ page }) => {
		await page.goto('/photography');
		await expect(page).toHaveScreenshot({
			maxDiffPixelRatio: 0.01
		});
	});
});
