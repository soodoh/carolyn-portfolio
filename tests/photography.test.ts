import { expect, type Locator, type Page, test } from "@playwright/test";
import {
	expectDesktopFilterIndicator,
	expectFilterFocusWithoutOutline,
	expectStickyFilterBelowHeader,
	selectFilter,
	settleVisualPage,
} from "@/tests/visual-helpers";

const photographyFilters = ["Dance", "Portraits", "Spaces"] as const;
const albumExpectations = {
	Dance: { count: 80, firstPhotoId: "3sRYLFv2ZA04TM8XjdhAp6" },
	Portraits: { count: 54, firstPhotoId: "5NOzE4gdq7VitF4TY4fAT8" },
	Spaces: { count: 70, firstPhotoId: "6RP9pIfL29LSaRsR86ePjC" },
} as const;
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
	await expect(currentImage).toHaveAttribute("alt", /\S/);
	await expect(
		dialog.getByText(`${index + 1} / ${dancePhotoCount}`, { exact: true }),
	).toBeVisible();
	await expect(
		dialog.locator("[data-slot='carousel-item']").nth(index),
	).toHaveAttribute("aria-label", `${index + 1} of ${dancePhotoCount}`);
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
			const selectedMobileFilter = page.getByRole("button", {
				name: filter,
				exact: true,
			});
			if (await selectedMobileFilter.isVisible()) {
				await expect(selectedMobileFilter).toHaveCSS(
					"border-top-style",
					"solid",
				);
			}
			await expectDesktopFilterIndicator(page, filter);
			await expectFilterFocusWithoutOutline(page, filter);
			const expectation = albumExpectations[filter];
			const thumbnails = page
				.locator(".masonry-grid")
				.getByRole("button", { name: /View fullscreen photo/ });
			await expect(thumbnails).toHaveCount(expectation.count);
			await expect(thumbnails.first().locator("img")).toHaveAttribute(
				"src",
				new RegExp(expectation.firstPhotoId),
			);
			await settleVisualPage(page);
			await expect(page).toHaveScreenshot(
				`photography-filter-${filter.toLowerCase()}.png`,
			);
		});
	}

	test("matches the selected Portraits filter while scrolled", async ({
		page,
	}) => {
		await selectFilter(page, "Dance", "Portraits");
		await settleVisualPage(page);
		await expectFilterFocusWithoutOutline(page, "Portraits");
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.nth(8)
			.scrollIntoViewIfNeeded();
		await expectStickyFilterBelowHeader(page);
		await expect(page).toHaveScreenshot(
			"photography-filter-portraits-scrolled.png",
		);
	});

	test("matches a portrait-oriented photo", async ({ page }) => {
		await selectFilter(page, "Dance", "Portraits");
		await page
			.locator(".masonry-grid")
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
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();
		await expect(page.getByRole("dialog")).toBeVisible();
		await settleVisualPage(page);
		await expect(page).toHaveScreenshot("photography-landscape-photo.png");
	});
});

test.describe("Photography album loading", () => {
	test("keeps the latest selection when requests finish out of order", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		let releaseDelayedRequest = () => {};
		let markRequestStarted = () => {};
		let markRequestFinished = () => {};
		const delayedRequest = new Promise<void>((resolve) => {
			releaseDelayedRequest = resolve;
		});
		const requestStarted = new Promise<void>((resolve) => {
			markRequestStarted = resolve;
		});
		const requestFinished = new Promise<void>((resolve) => {
			markRequestFinished = resolve;
		});
		await page.route("**/_serverFn/**", async (route) => {
			if (!route.request().postData()?.includes("Portraits")) {
				await route.continue();
				return;
			}
			markRequestStarted();
			await delayedRequest;
			const response = await route.fetch();
			await route.fulfill({ response });
			markRequestFinished();
		});
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();

		const portraits = page.getByRole("button", {
			name: "Choose filter: Portraits",
		});
		const dance = page.getByRole("button", {
			name: "Choose filter: Dance",
		});
		await portraits.click();
		await requestStarted;
		await expect(portraits).toHaveAttribute("aria-pressed", "true");
		await expect(
			page
				.locator(".masonry-grid")
				.getByRole("button", { name: /View fullscreen photo/ })
				.first(),
		).toBeDisabled();
		await dance.click();
		await expect(dance).toHaveAttribute("aria-pressed", "true");
		releaseDelayedRequest();
		await requestFinished;

		await expect(page.locator("[aria-busy='true']")).toHaveCount(0);
		const firstThumbnail = page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first();
		await expect(firstThumbnail).toBeEnabled();
		await expect(firstThumbnail.locator("img")).toHaveAttribute(
			"src",
			/3sRYLFv2ZA04TM8XjdhAp6/,
		);
	});
});

test.describe("Photography gallery navigation", () => {
	test("prioritizes the selected fullscreen image", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		const fullSizeRequests = new Set<string>();
		page.on("request", (request) => {
			const url = request.url();
			if (
				/(?:\/test-assets\/|ctfassets)/i.test(url) &&
				/[?&]q=100(?:&|$)/.test(url)
			) {
				fullSizeRequests.add(url);
			}
		});
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		expect(fullSizeRequests.size).toBe(0);

		const selectedThumbnail = page
			.locator(".masonry-grid")
			.getByRole("button", {
				name: /View fullscreen photo \(2018-08-16-Mariana-edit-LR-03766\)/,
			});
		await expect
			.poll(() =>
				selectedThumbnail
					.locator("img")
					.evaluate(
						(image: HTMLImageElement) =>
							image.complete && image.naturalWidth > 0,
					),
			)
			.toBe(true);
		await selectedThumbnail.click();
		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		await expect(dialog.getByText("21 / 80", { exact: true })).toBeVisible();
		await expect
			.poll(() =>
				[...fullSizeRequests].some((url) =>
					url.includes("7oSrphqd8s228aK4oCAuCY"),
				),
			)
			.toBe(true);

		const requests = [...fullSizeRequests];
		expect(requests.some((url) => url.includes("7oSrphqd8s228aK4oCAuCY"))).toBe(
			true,
		);
		expect(requests.some((url) => url.includes(dancePhotoIds[0]))).toBe(false);
	});

	test("navigates efficiently and restores focus", async ({ page }) => {
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		const openingThumbnail = page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first();
		const fullSizeRequests: string[] = [];
		page.on("request", (request) => {
			const url = request.url();
			if (
				/(?:\/test-assets\/|ctfassets)/i.test(url) &&
				/[?&]q=100(?:&|$)/.test(url)
			) {
				fullSizeRequests.push(url);
			}
		});
		await openingThumbnail.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		await expectGalleryState(dialog, 0);
		await expect.poll(() => fullSizeRequests.length).toBeGreaterThan(0);
		expect(fullSizeRequests.length).toBeLessThan(10);

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

		await dialog.getByRole("button", { name: "Close image modal" }).click();
		await expect(dialog).toBeHidden();
		await expect(openingThumbnail).toBeFocused();
	});
});
