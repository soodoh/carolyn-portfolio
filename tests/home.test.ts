import { expect, test } from "@/tests/playwright";
import {
	expectCurrentPath,
	expectFullPageScreenshot,
	expectStickyFilterBelowHeader,
	settleVisualPage,
} from "@/tests/visual-helpers";

test.describe("Home page visual states", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("matches the entire page", async ({ page }) => {
		await expectFullPageScreenshot(page, "home-full-page.png", {
			expectedPath: "/",
		});
	});

	test("matches the top of the page", async ({ page }) => {
		await settleVisualPage(page, { expectedPath: "/" });
		await expect(page.locator("[data-home-hero]")).toBeVisible();
		await expect(page.locator("main img").first()).toHaveAttribute("alt", "");
		await expect(page).toHaveScreenshot("home-top.png");
	});

	test("matches the sticky projects filter below the scrolled header", async ({
		page,
	}) => {
		await settleVisualPage(page, { expectedPath: "/" });
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
		await expectCurrentPath(page, "/");
		await expectStickyFilterBelowHeader(page);
		await expect(page).toHaveScreenshot("home-scrolled-header.png");
	});
});
