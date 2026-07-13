import { expect, test } from "@playwright/test";
import {
	expectFullPageScreenshot,
	prepareVisualPage,
	selectFilter,
	settleVisualPage,
} from "@/tests/visual-helpers";

const photographyFilters = ["Dance", "Portraits", "Spaces"];

test.describe("Photography visual states", () => {
	test.beforeEach(async ({ page }) => {
		await prepareVisualPage(page);
		await page.goto("/photography");
	});

	for (const filter of photographyFilters) {
		test(`matches the ${filter} filter`, async ({ page }) => {
			if (filter !== photographyFilters[0]) {
				await selectFilter(page, photographyFilters[0], filter);
			}
			await expectFullPageScreenshot(
				page,
				`photography-filter-${filter.toLowerCase()}.png`,
			);
		});
	}

	test("matches a portrait-oriented photo", async ({ page }) => {
		await selectFilter(page, "Dance", "Portraits");
		await page
			.getByRole("tabpanel")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();
		await expect(page.getByRole("dialog")).toBeVisible();
		await settleVisualPage(page);
		await expect(page).toHaveScreenshot("photography-portrait-photo.png");
	});

	test("matches a landscape-oriented photo", async ({ page }) => {
		await selectFilter(page, "Dance", "Spaces");
		await page
			.getByRole("tabpanel")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();
		await expect(page.getByRole("dialog")).toBeVisible();
		await settleVisualPage(page);
		await expect(page).toHaveScreenshot("photography-landscape-photo.png");
	});
});
