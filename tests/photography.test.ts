import type { Locator, Page } from "@playwright/test";
import { expect, fetchRoutedResponse, test } from "@/tests/playwright";
import {
	expectControlContrast,
	expectCurrentPath,
	expectDarkSurfaceFocus,
	expectDesktopFilterIndicator,
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
const serializedPlaceholderPattern =
	/data:image\/jpg;base64,[A-Za-z0-9+/=]+|https:\/\/images\.ctfassets\.net\/hermetic-build\/[^"?]+\/fixture\.jpg\?w=25&q=30&fm=jpg/g;

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
	const activeSlide = dialog.locator("[data-slot='carousel-item']").nth(index);
	await expect(activeSlide).toHaveAttribute(
		"aria-label",
		`${index + 1} of ${dancePhotoCount}`,
	);
	await expect(activeSlide).toHaveAttribute("aria-hidden", "false");
}

async function expectModalImageSelection(
	image: Locator,
	width: number,
	height: number,
): Promise<void> {
	await image.evaluate(async (element: HTMLImageElement) => element.decode());
	const landscape = width >= height;
	const aspectRatio = width / height;
	const expectedSizes = landscape
		? "100vw"
		: `min(100vw, calc(${(aspectRatio * 100).toFixed(4)}vh - ${(aspectRatio * 40).toFixed(4)}px))`;
	await expect(image).toHaveAttribute("sizes", expectedSizes);

	const selection = await image.evaluate((element: HTMLImageElement) => ({
		currentSrc: element.currentSrc,
		dpr: window.devicePixelRatio,
		srcset: element.srcset,
		viewportHeight: window.innerHeight,
		viewportWidth: window.innerWidth,
	}));
	const selectedWidth = Number(
		new URL(selection.currentSrc).searchParams.get("w"),
	);
	const candidates = selection.srcset
		.split(",")
		.map((candidate) => Number(candidate.trim().match(/ (\d+)w$/)?.[1]))
		.filter((candidate) => Number.isFinite(candidate))
		.toSorted((first, second) => first - second);
	const cssWidth = landscape
		? selection.viewportWidth
		: Math.min(
				selection.viewportWidth,
				(selection.viewportHeight - 40) * aspectRatio,
			);
	const requestedWidth = cssWidth * selection.dpr;
	const roundedBound =
		candidates.find((candidate) => candidate >= requestedWidth) ??
		candidates.at(-1);
	if (roundedBound === undefined) {
		throw new Error("Modal image is missing analyzable width candidates.");
	}
	expect(selectedWidth).toBeGreaterThanOrEqual(
		Math.min(requestedWidth, roundedBound),
	);
	expect(selectedWidth).toBeLessThanOrEqual(roundedBound);
}

async function touchSwipeGallery(
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
	const session = await page.context().newCDPSession(page);
	try {
		await session.send("Input.dispatchTouchEvent", {
			type: "touchStart",
			touchPoints: [{ x: startX, y }],
		});
		for (let step = 1; step <= 10; step += 1) {
			await session.send("Input.dispatchTouchEvent", {
				type: "touchMove",
				touchPoints: [{ x: startX + ((endX - startX) * step) / 10, y }],
			});
		}
		await session.send("Input.dispatchTouchEvent", {
			type: "touchEnd",
			touchPoints: [],
		});
	} finally {
		await session.detach();
	}
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
			const expectation = albumExpectations[filter];
			const thumbnails = page
				.locator(".masonry-grid")
				.getByRole("button", { name: /View fullscreen photo/ });
			await expect(thumbnails).toHaveCount(expectation.count);
			await expect(thumbnails.first().locator("img")).toHaveAttribute(
				"src",
				new RegExp(expectation.firstPhotoId),
			);
			await expect(page.locator("[data-photography-album]")).toHaveAttribute(
				"data-photography-album",
				filter,
			);
			await settleVisualPage(page, {
				expectedPath: "/photography",
				album: filter,
			});
			await expect(page).toHaveScreenshot(
				`photography-filter-${filter.toLowerCase()}.png`,
			);
		});
	}

	test("matches the selected Portraits filter while scrolled", async ({
		page,
	}) => {
		await selectFilter(page, "Dance", "Portraits");
		await settleVisualPage(page, {
			expectedPath: "/photography",
			album: "Portraits",
		});
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.nth(8)
			.scrollIntoViewIfNeeded();
		await expectCurrentPath(page, "/photography");
		await expect(page.locator("[data-photography-album]")).toHaveAttribute(
			"data-photography-album",
			"Portraits",
		);
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
		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		await settleVisualPage(page, {
			expectedPath: "/photography",
			album: "Portraits",
			images: () => dialog.locator("img"),
		});
		await expect(dialog.locator("[aria-hidden='false'] img")).toBeVisible();
		await expect(page).toHaveScreenshot("photography-portrait-photo.png");
	});

	test("matches a landscape-oriented photo", async ({ page }) => {
		await selectFilter(page, "Dance", "Spaces");
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();
		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		await settleVisualPage(page, {
			expectedPath: "/photography",
			album: "Spaces",
			images: () => dialog.locator("img"),
		});
		await expect(dialog.locator("[aria-hidden='false'] img")).toBeVisible();
		await expect(page).toHaveScreenshot("photography-landscape-photo.png");
	});
});

test.describe("Photography album loading", () => {
	test("bounds eager remote placeholders to the likely LCP thumbnail", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		const remotePlaceholder =
			"https://images.ctfassets.net/live-shaped/placeholder.jpg?w=25&q=30&fm=jpg";
		let placeholderRequests = 0;
		let markPlaceholderRequested = () => {};
		const placeholderRequested = new Promise<void>((resolve) => {
			markPlaceholderRequested = resolve;
		});
		await page.route(
			"https://images.ctfassets.net/live-shaped/**",
			async (route) => {
				placeholderRequests += 1;
				markPlaceholderRequested();
				await route.fulfill({ status: 204 });
			},
		);
		await page.route(
			`https://images.ctfassets.net/hermetic-build/${albumExpectations.Portraits.firstPhotoId}/**`,
			async (route) => {
				if (route.request().url().includes("q=80")) {
					await placeholderRequested;
				}
				await route.fallback();
			},
		);
		await page.route("**/_serverFn/**", async (route) => {
			if (!route.request().postData()?.includes("Portraits")) {
				await route.continue();
				return;
			}
			const response = await fetchRoutedResponse(route);
			const body = (await response.text()).replace(
				serializedPlaceholderPattern,
				remotePlaceholder,
			);
			expect(body).toContain(remotePlaceholder);
			await route.fulfill({ response, body });
		});
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();

		await selectFilter(page, "Dance", "Portraits");
		await expect(
			page
				.locator(".masonry-grid")
				.getByRole("button", { name: /View fullscreen photo/ }),
		).toHaveCount(albumExpectations.Portraits.count);
		await expect.poll(() => placeholderRequests).toBe(1);
		const albumImages = page.locator(".masonry-grid img");
		await expect(albumImages.first()).toHaveAttribute("fetchpriority", "high");
		await expect(albumImages.first()).not.toHaveAttribute("loading", "lazy");
		await expect(albumImages.nth(1)).toHaveAttribute("loading", "lazy");
		await expect(albumImages.nth(1)).not.toHaveAttribute(
			"style",
			/background-image/,
		);
		await expect(
			page.locator(".masonry-grid img[fetchpriority='high']"),
		).toHaveCount(1);
	});

	test("reuses albums already loaded during the visit", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		let portraitRequests = 0;
		page.on("request", (request) => {
			if (
				request.method() === "POST" &&
				request.url().includes("/_serverFn/") &&
				request.postData()?.includes("Portraits")
			) {
				portraitRequests += 1;
			}
		});
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();

		await selectFilter(page, "Dance", "Portraits");
		await selectFilter(page, "Portraits", "Dance");
		await selectFilter(page, "Dance", "Portraits");

		expect(portraitRequests).toBe(1);
		await expect(
			page
				.locator(".masonry-grid")
				.getByRole("button", { name: /View fullscreen photo/ }),
		).toHaveCount(albumExpectations.Portraits.count);
	});

	test("performs each filter selection action once", async ({ page }) => {
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		await page.evaluate(() => {
			document.addEventListener(
				"click",
				(event) => {
					if (!(event.target instanceof Element)) {
						return;
					}
					const action = event.target.closest("button, [role='menuitem']");
					if (!(action instanceof HTMLElement)) {
						return;
					}
					const label =
						action.getAttribute("aria-label") ?? action.textContent?.trim();
					if (!label) {
						return;
					}
					const log = document.documentElement.dataset.filterClickLog ?? "";
					document.documentElement.dataset.filterClickLog = `${log}${label}\n`;
				},
				{ capture: true },
			);
		});

		await selectFilter(page, "Dance", "Portraits");

		const clickLog = await page
			.locator("html")
			.evaluate((element) =>
				(element.dataset.filterClickLog ?? "").split("\n").filter(Boolean),
			);
		const portraitActions = clickLog.filter((label) =>
			label.includes("Portraits"),
		);
		expect(portraitActions).toHaveLength(1);
		if (clickLog.includes("Dance")) {
			expect(clickLog.filter((label) => label === "Dance")).toHaveLength(1);
		}
	});

	test("deduplicates rapid switches to an in-flight album", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		let portraitRequests = 0;
		let releasePortraits = () => {};
		let markPortraitsStarted = () => {};
		const portraitsStarted = new Promise<void>((resolve) => {
			markPortraitsStarted = resolve;
		});
		const delayedPortraits = new Promise<void>((resolve) => {
			releasePortraits = resolve;
		});
		await page.route("**/_serverFn/**", async (route) => {
			if (!route.request().postData()?.includes("Portraits")) {
				await route.continue();
				return;
			}
			portraitRequests += 1;
			markPortraitsStarted();
			await delayedPortraits;
			const response = await fetchRoutedResponse(route);
			await route.fulfill({ response });
		});
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();

		const portraits = page.getByRole("button", {
			name: "Choose filter: Portraits",
		});
		const spaces = page.getByRole("button", {
			name: "Choose filter: Spaces",
		});
		await portraits.click();
		await portraitsStarted;
		await spaces.click();
		await portraits.click();
		expect(portraitRequests).toBe(1);

		releasePortraits();
		await expect(page.locator("[aria-busy='true']")).toHaveCount(0);
		await expect(portraits).toHaveAttribute("aria-pressed", "true");
		await expect(
			page
				.locator(".masonry-grid")
				.getByRole("button", { name: /View fullscreen photo/ }),
		).toHaveCount(albumExpectations.Portraits.count);
	});

	test("evicts rejected album requests so the selection can retry", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		let portraitRequests = 0;
		await page.route("**/_serverFn/**", async (route) => {
			if (!route.request().postData()?.includes("Portraits")) {
				await route.continue();
				return;
			}
			portraitRequests += 1;
			if (portraitRequests === 1) {
				await route.fulfill({ status: 503, body: "temporary failure" });
				return;
			}
			await route.continue();
		});
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();

		const portraits = page.getByRole("button", {
			name: "Choose filter: Portraits",
		});
		await portraits.click();
		await expect(page.getByRole("alert")).toContainText("Unable to load");
		await portraits.click();

		await expect(page.locator("[aria-busy='true']")).toHaveCount(0);
		expect(portraitRequests).toBe(2);
		await expect(
			page
				.locator(".masonry-grid")
				.getByRole("button", { name: /View fullscreen photo/ }),
		).toHaveCount(albumExpectations.Portraits.count);
	});

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
			const response = await fetchRoutedResponse(route);
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
	test("selects aspect-aware modal widths for portrait and landscape images", async ({
		page,
	}) => {
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();

		await selectFilter(page, "Dance", "Portraits");
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();
		let dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		await expect(
			dialog.getByRole("region", { name: "Photography image gallery" }),
		).toBeVisible();
		await expectModalImageSelection(
			dialog.locator("[aria-hidden='false'] img"),
			1272,
			1920,
		);
		await dialog.getByRole("button", { name: "Close image modal" }).click();

		await selectFilter(page, "Portraits", "Spaces");
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();
		dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		await expectModalImageSelection(
			dialog.locator("[aria-hidden='false'] img"),
			1920,
			1280,
		);
	});

	test("announces a delayed gallery chunk on first touch", {
		tag: "@mobile-only",
	}, async ({ page }) => {
		let markGalleryRequested = () => {};
		let releaseGallery = () => {};
		const galleryRequested = new Promise<void>((resolve) => {
			markGalleryRequested = resolve;
		});
		const galleryDelay = new Promise<void>((resolve) => {
			releaseGallery = resolve;
		});
		await page.route("**/*image-gallery*", async (route) => {
			markGalleryRequested();
			await galleryDelay;
			await route.continue();
		});

		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		const thumbnail = page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first();
		await thumbnail.tap();
		await galleryRequested;

		const dialog = page.getByRole("dialog", { name: "Image Gallery" });
		await expect(dialog).toBeVisible();
		await expect(dialog).toHaveAttribute("aria-modal", "true");
		const loadingStatus = dialog
			.getByRole("status")
			.filter({ hasText: "Loading image gallery…" });
		await expect(loadingStatus).toBeVisible();
		await expect(loadingStatus).toHaveAttribute("aria-busy", "true");
		await expect(
			page.getByRole("button", { name: /View fullscreen photo/ }),
		).toHaveCount(0);
		const closeButton = dialog.getByRole("button", {
			name: "Close image modal",
		});
		await expect(closeButton).toHaveCount(1);
		await expect(closeButton).toBeFocused();
		await expectDarkSurfaceFocus(closeButton);
		await closeButton.evaluate((element) => {
			element.dataset.galleryCloseIdentity = "preserved";
		});
		await page.keyboard.press("Tab");
		await expect(closeButton).toBeFocused();

		releaseGallery();
		await expect(
			dialog.getByRole("region", { name: "Photography image gallery" }),
		).toBeVisible();
		await expect(loadingStatus).toHaveCount(0);
		await expect(closeButton).toHaveCount(1);
		await expect(closeButton).toHaveAttribute(
			"data-gallery-close-identity",
			"preserved",
		);
		await expect(closeButton).toBeFocused();
		await page.keyboard.press("ArrowRight");
		await expectGalleryState(dialog, 1);
		await closeButton.click();
		await expect(thumbnail).toBeFocused();
	});

	test("keeps gallery chunk failures modal and recoverable", {
		tag: "@mobile-only",
	}, async ({ page }) => {
		const galleryRoute = "**/*image-gallery*";
		await page.route(galleryRoute, (route) =>
			route.fulfill({
				body: 'throw new Error("gallery chunk failed");',
				contentType: "application/javascript",
				status: 200,
			}),
		);

		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		const thumbnail = page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first();
		await thumbnail.tap();

		let dialog = page.getByRole("dialog", { name: "Image Gallery" });
		await expect(dialog).toBeVisible();
		const errorSurface = dialog.getByRole("alert").filter({
			hasText: "Unable to load the image gallery.",
		});
		await expect(errorSurface).toBeVisible();
		await expect(errorSurface).toHaveCSS("background-color", "rgb(0, 0, 0)");
		await expect(
			page.getByRole("button", { name: /View fullscreen photo/ }),
		).toHaveCount(0);
		const closeButton = dialog.getByRole("button", {
			name: "Close image modal",
		});
		await expectControlContrast(closeButton, errorSurface);
		await expectDarkSurfaceFocus(closeButton);
		await closeButton.click();
		await expect(dialog).toHaveCount(0);
		await expect(thumbnail).toBeFocused();

		await thumbnail.tap();
		dialog = page.getByRole("dialog", { name: "Image Gallery" });
		await expect(
			dialog.getByRole("button", { name: "Reload page" }),
		).toBeVisible();
		await page.unroute(galleryRoute);
		await dialog.getByRole("button", { name: "Reload page" }).click();
		await page.locator("html[data-hydrated='true']").waitFor();
		await expect(page.getByRole("dialog")).toHaveCount(0);
		await expect(
			page.getByRole("button", { name: /View fullscreen photo/ }).first(),
		).toBeVisible();
	});

	test("preloads the lazy gallery chunk on thumbnail focus", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		const galleryModuleRequests = new Set<string>();
		page.on("request", (request) => {
			if (new URL(request.url()).pathname.includes("image-gallery")) {
				galleryModuleRequests.add(request.url());
			}
		});

		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		expect(galleryModuleRequests.size).toBe(0);

		const thumbnail = page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first();
		await thumbnail.focus();
		await expect.poll(() => galleryModuleRequests.size).toBeGreaterThan(0);
		await expect(page.getByRole("dialog")).toHaveCount(0);

		await thumbnail.click();
		await expect(page.getByRole("dialog")).toBeVisible();
	});

	test("keeps remote-placeholder image nodes stable across priority changes", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		const remotePlaceholder =
			"https://images.ctfassets.net/gallery-placeholder/placeholder.jpg?w=25&q=30&fm=jpg";
		let placeholderRequests = 0;
		const fullSizeRequests = new Set<string>();
		await page.addInitScript(() => {
			const originalDecode = HTMLImageElement.prototype.decode;
			HTMLImageElement.prototype.decode = function decode() {
				const current = Number(
					document.documentElement.dataset.imageDecodeCalls ?? "0",
				);
				document.documentElement.dataset.imageDecodeCalls = String(current + 1);
				return originalDecode.call(this);
			};
		});
		await page.route(
			"https://images.ctfassets.net/gallery-placeholder/**",
			async (route) => {
				placeholderRequests += 1;
				await route.fulfill({ path: "public/favicon.png", status: 200 });
			},
		);
		await page.route("**/_serverFn/**", async (route) => {
			if (!route.request().postData()?.includes("Portraits")) {
				await route.continue();
				return;
			}
			const response = await fetchRoutedResponse(route);
			const body = (await response.text()).replace(
				serializedPlaceholderPattern,
				remotePlaceholder,
			);
			await route.fulfill({ response, body });
		});
		page.on("request", (request) => {
			const url = request.url();
			if (
				/(?:\/test-assets\/|ctfassets)/i.test(url) &&
				/[?&]q=80(?:&|$)/.test(url)
			) {
				fullSizeRequests.add(url);
			}
		});

		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		await selectFilter(page, "Dance", "Portraits");
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		const firstImage = dialog.locator("img").first();
		await firstImage.evaluate((image) => {
			image.dataset.galleryIdentity = "preserved";
		});
		await dialog.getByRole("button", { name: "Next slide" }).click();
		await expect(dialog.getByText("2 / 54", { exact: true })).toBeVisible();
		await expect(firstImage).toHaveAttribute(
			"data-gallery-identity",
			"preserved",
		);
		await expect.poll(() => placeholderRequests).toBeGreaterThan(0);
		expect(placeholderRequests).toBeLessThanOrEqual(2);
		expect(fullSizeRequests.size).toBeLessThanOrEqual(4);
		expect(
			Number(
				await page.locator("html").getAttribute("data-image-decode-calls"),
			),
		).toBeLessThanOrEqual(2);
	});

	test("prioritizes the selected fullscreen image", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		const fullSizeRequests = new Set<string>();
		page.on("request", (request) => {
			const url = request.url();
			if (
				/(?:\/test-assets\/|ctfassets)/i.test(url) &&
				/[?&]q=80(?:&|$)/.test(url)
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

	test("windows fullscreen images while keeping the final photo reachable", async ({
		page,
	}) => {
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.last()
			.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		await expect(dialog.getByText("80 / 80", { exact: true })).toBeVisible();
		await expect(dialog.locator("img")).toHaveCount(2);

		await dialog.getByRole("button", { name: "Previous slide" }).click();
		await expect(dialog.getByText("79 / 80", { exact: true })).toBeVisible();
		await expect(dialog.locator("img")).toHaveCount(3);
	});

	test("navigates with buttons and restores focus", async ({ page }) => {
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
				/[?&]q=80(?:&|$)/.test(url)
			) {
				fullSizeRequests.push(url);
			}
		});
		await openingThumbnail.click();

		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		await expectGalleryState(dialog, 0);
		const liveRegion = dialog.locator("[aria-live='polite']");
		await expect(liveRegion).toHaveCount(1);
		await expect(liveRegion).toHaveAttribute("aria-atomic", "true");
		await expect(liveRegion).toHaveText(`1 / ${dancePhotoCount}`);
		await expect.poll(() => fullSizeRequests.length).toBeGreaterThan(0);
		expect(fullSizeRequests.length).toBeLessThan(10);
		await expectDarkSurfaceFocus(
			dialog.getByRole("button", { name: "Close image modal" }),
		);
		await expectDarkSurfaceFocus(
			dialog.getByRole("button", { name: "Next slide" }),
		);

		await dialog.getByRole("button", { name: "Next slide" }).click();
		await expectGalleryState(dialog, 1);
		await expect(liveRegion).toHaveText(`2 / ${dancePhotoCount}`);
		await expectDarkSurfaceFocus(
			dialog.getByRole("button", { name: "Previous slide" }),
		);
		await dialog.getByRole("button", { name: "Previous slide" }).click();
		await expectGalleryState(dialog, 0);
		await expectCurrentPath(page, "/photography");

		await dialog.getByRole("button", { name: "Close image modal" }).click();
		await expect(dialog).toBeHidden();
		await expect(openingThumbnail).toBeFocused();
	});

	test("replays immediate close-button keyboard navigation after gallery initialization", {
		tag: "@mobile-only",
	}, async ({ page }) => {
		await page.addInitScript(() => {
			const observer = new MutationObserver(() => {
				const gallery = document.querySelector(
					'[data-slot="carousel"][aria-label="Photography image gallery"]',
				);
				const closeButton = document.querySelector<HTMLButtonElement>(
					'button[aria-label="Close image modal"]',
				);
				if (!gallery || !closeButton) {
					return;
				}
				const event = new KeyboardEvent("keydown", {
					bubbles: true,
					cancelable: true,
					key: "ArrowRight",
				});
				closeButton.dispatchEvent(event);
				document.documentElement.dataset.immediateGalleryKeyPrevented = String(
					event.defaultPrevented,
				);
				observer.disconnect();
			});
			observer.observe(document, { childList: true, subtree: true });
		});
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();

		const dialog = page.getByRole("dialog");
		await expect(
			dialog.getByRole("region", { name: "Photography image gallery" }),
		).toBeVisible();
		await expect(page.locator("html")).toHaveAttribute(
			"data-immediate-gallery-key-prevented",
			"true",
		);
		await expectGalleryState(dialog, 1);
	});

	test("jumps close-button keyboard navigation under reduced motion", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();

		const dialog = page.getByRole("dialog");
		const gallery = dialog.getByRole("region", {
			name: "Photography image gallery",
		});
		await expect(gallery).toBeVisible();
		const track = gallery.locator('[data-slot="carousel-content"] > div');
		const closeButton = dialog.getByRole("button", {
			name: "Close image modal",
		});
		await closeButton.focus();
		await closeButton.press("ArrowRight");
		const transformAfterKey = await track.evaluate(
			(element) => getComputedStyle(element).transform,
		);
		await expectGalleryState(dialog, 1);
		await page.waitForTimeout(100);
		expect(
			await track.evaluate((element) => getComputedStyle(element).transform),
		).toBe(transformAfterKey);
	});

	test("navigates with the keyboard", async ({ page }) => {
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();
		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		await expect(
			dialog.getByRole("region", { name: "Photography image gallery" }),
		).toBeVisible();
		await dialog.getByRole("button", { name: "Close image modal" }).focus();
		await page.keyboard.press("ArrowRight");
		await expectGalleryState(dialog, 1);
		await page.keyboard.press("ArrowLeft");
		await expectGalleryState(dialog, 0);
		await expectCurrentPath(page, "/photography");
	});

	test("navigates with genuine touch drags", {
		tag: "@mobile-only",
	}, async ({ page }) => {
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();
		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();
		await expectGalleryState(dialog, 0);

		await touchSwipeGallery(page, dialog, "next");
		await expectGalleryState(dialog, 1);
		await touchSwipeGallery(page, dialog, "previous");
		await expectGalleryState(dialog, 0);
		await expectCurrentPath(page, "/photography");
	});
});
