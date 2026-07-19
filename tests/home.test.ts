import { expect, test } from "@playwright/test";
import {
	expectFullPageScreenshot,
	expectStickyFilterBelowHeader,
	settleVisualPage,
} from "@/tests/visual-helpers";

test.describe("Home page visual states", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("matches the entire page", async ({ page }) => {
		await expectFullPageScreenshot(page, "home-full-page.png");
	});

	test("matches the top of the page", async ({ page }) => {
		await settleVisualPage(page);
		await expect(page).toHaveScreenshot("home-top.png");
	});

	test("matches the sticky projects filter below the scrolled header", async ({
		page,
	}) => {
		await settleVisualPage(page);
		const header = page.locator("header");
		const brandLogo = header.locator('a[aria-label="Home"]');
		await expect(brandLogo).toBeHidden();
		await page
			.locator(".masonry-grid")
			.getByRole("link")
			.last()
			.scrollIntoViewIfNeeded();
		await expect(brandLogo).toBeVisible();
		await expect(header).toHaveCSS("background-color", "rgb(73, 79, 92)");
		await expect.poll(async () => (await header.boundingBox())?.y).toBe(0);
		await expectStickyFilterBelowHeader(page);
		await expect(page).toHaveScreenshot("home-scrolled-header.png");
	});
});
