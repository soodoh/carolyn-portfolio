import { expect, type Locator, type Page, test } from "@playwright/test";
import {
	expectFullPageScreenshot,
	prepareVisualPage,
	selectFilter,
	settleVisualPage,
} from "@/tests/visual-helpers";

const photographyFilters = ["Dance", "Portraits", "Spaces"];
const dancePhotoIds = ["3sRYLFv2ZA04TM8XjdhAp6", "5NTTQtmygIfQAxLnvyyCSN"];
const dancePhotoCount = 80;

async function expectGalleryState(
	dialog: Locator,
	index: number,
): Promise<void> {
	const currentImage = dialog.locator("img").nth(index);
	await expect(currentImage).toHaveAttribute(
		"src",
		new RegExp(dancePhotoIds[index]),
	);
	await expect(currentImage).toBeInViewport({ ratio: 0.5 });
	await expect(
		dialog.getByText(`${index + 1} / ${dancePhotoCount}`, { exact: true }),
	).toBeVisible();
}

async function swipeGallery(
	page: Page,
	dialog: Locator,
	direction: "next" | "previous",
): Promise<void> {
	const carousel = dialog.locator("[data-slot='carousel-content']");
	const box = await carousel.boundingBox();
	if (!box) {
		throw new Error("Gallery carousel is not visible");
	}

	const startX = box.x + box.width * (direction === "next" ? 0.75 : 0.25);
	const endX = box.x + box.width * (direction === "next" ? 0.25 : 0.75);
	const y = box.y + box.height / 2;
	await page.mouse.move(startX, y);
	await page.mouse.down();
	await page.mouse.move(endX, y, { steps: 10 });
	await page.mouse.up();
}

test.describe("Photography visual states", () => {
	test.beforeEach(async ({ page }) => {
		await prepareVisualPage(page);
		await page.goto("/photography");
	});

	for (const filter of photographyFilters) {
		test(`matches the ${filter} filter`, async ({ page }) => {
			const mobileFilter = page.getByRole("button", {
				name: photographyFilters[0],
				exact: true,
			});
			if (await mobileFilter.isVisible()) {
				await expect(mobileFilter).toHaveCSS("padding", "4px 8px");
			}
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

test.describe("Photography gallery navigation", () => {
	test("navigates by buttons, keyboard arrows, and swipes", async ({
		page,
	}) => {
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		await page
			.getByRole("tabpanel")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		await expectGalleryState(dialog, 0);

		await dialog.getByRole("button", { name: "Next slide" }).click();
		await expectGalleryState(dialog, 1);

		await dialog.getByRole("button", { name: "Previous slide" }).click();
		await expectGalleryState(dialog, 0);

		await dialog.getByRole("button", { name: "Close image modal" }).focus();
		await page.keyboard.press("ArrowRight");
		await expectGalleryState(dialog, 1);

		await page.keyboard.press("ArrowLeft");
		await expectGalleryState(dialog, 0);

		await swipeGallery(page, dialog, "next");
		await expectGalleryState(dialog, 1);

		await swipeGallery(page, dialog, "previous");
		await expectGalleryState(dialog, 0);
	});
});
