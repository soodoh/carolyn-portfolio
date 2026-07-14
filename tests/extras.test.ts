import { expect, test } from "@playwright/test";
import {
	expectFullPageScreenshot,
	prepareVisualPage,
} from "@/tests/visual-helpers";

test.describe("Static route visual states", () => {
	test.beforeEach(async ({ page }) => {
		await prepareVisualPage(page);
	});

	test("matches the entire About page", async ({ page }) => {
		await page.goto("/about");
		await expectFullPageScreenshot(page, "about-full-page.png", {
			fixedBackground: page.locator("[data-fixed-background]"),
		});
	});

	test("matches the entire not-found page", async ({ page }) => {
		const response = await page.goto("/route-that-does-not-exist");
		expect(response?.status()).toBe(404);
		await expect(page).toHaveTitle("CD: Page Not Found");
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			"The page you are looking for does not exist.",
		);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
			"content",
			"noindex, nofollow",
		);
		await expectFullPageScreenshot(page, "not-found-full-page.png");
	});

	test("redirects the Resume route to the captured document", async ({
		request,
	}) => {
		const response = await request.get("/resume", { maxRedirects: 0 });
		expect(response.status()).toBe(308);
		expect(response.headers().location).toMatch(
			/2025_Carolyn_DiLoreto_Resume\.pdf$/,
		);
	});
});
