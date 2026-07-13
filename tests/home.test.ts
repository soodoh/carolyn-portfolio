import { expect, test } from "@playwright/test";
import {
	expectFullPageScreenshot,
	prepareVisualPage,
	settleVisualPage,
} from "@/tests/visual-helpers";

test.describe("Home page visual states", () => {
	test.beforeEach(async ({ page }) => {
		await prepareVisualPage(page);
		await page.goto("/");
	});

	test("matches the entire page", async ({ page }) => {
		await expectFullPageScreenshot(page, "home-full-page.png");
	});

	test("matches the top of the page", async ({ page }) => {
		await settleVisualPage(page);
		await expect(page).toHaveScreenshot("home-top.png");
	});

	test("matches the header after scrolling past projects", async ({ page }) => {
		await settleVisualPage(page);
		const header = page.locator("header");
		const brandLogo = page.getByRole("link", { name: "Home" });
		await expect(brandLogo).toBeHidden();
		await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
		await expect(brandLogo).toBeVisible();
		await expect(header).toHaveCSS("background-color", "rgb(73, 79, 92)");
		await expect(page).toHaveScreenshot("home-scrolled-header.png");
	});
});
