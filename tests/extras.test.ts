import { expect, test } from "@/tests/playwright";
import {
	expectDarkSurfaceFocus,
	expectFullPageScreenshot,
	settleVisualPage,
} from "@/tests/visual-helpers";

test.describe("Route recovery", () => {
	test("retries a failed route loader", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		let loaderRequests = 0;
		await page.goto("/");
		await page.locator("html[data-hydrated='true']").waitFor();
		await page.route("**/_serverFn/**", async (route) => {
			loaderRequests += 1;
			if (loaderRequests === 1) {
				await route.fulfill({
					status: 503,
					contentType: "application/json",
					body: JSON.stringify({ error: "temporary loader failure" }),
				});
				return;
			}
			await route.continue();
		});

		await page.getByRole("link", { name: "Photography", exact: true }).click();
		await expect(
			page.getByRole("heading", { name: "Something went wrong" }),
		).toBeVisible();
		await page.getByRole("button", { name: "Try again" }).click();

		await expect(page).toHaveURL(/\/photography$/);
		await expect(
			page
				.locator(".masonry-grid")
				.getByRole("button", { name: /View fullscreen photo/ }),
		).toHaveCount(80);
		expect(loaderRequests).toBeGreaterThanOrEqual(2);
	});
});

test.describe("Header route state", () => {
	test("shows high-contrast focus on dark desktop and mobile navigation", async ({
		page,
	}) => {
		await page.goto("/about");
		await page.locator("html[data-hydrated='true']").waitFor();
		const mobileTrigger = page.getByRole("button", {
			name: "Open Navigation",
		});
		if (await mobileTrigger.isVisible()) {
			await expectDarkSurfaceFocus(mobileTrigger);
			await mobileTrigger.click();
			await expectDarkSurfaceFocus(
				page.getByRole("button", { name: "Close Navigation" }),
			);
			await expectDarkSurfaceFocus(
				page.getByRole("link", { name: "Photography", exact: true }),
			);
			return;
		}
		await expectDarkSurfaceFocus(
			page.getByRole("link", { name: "Home", exact: true }),
		);
		await expectDarkSurfaceFocus(
			page.getByRole("link", { name: "Photography", exact: true }),
		);
	});

	test("stays opaque across sibling navigation", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		await page.goto("/");
		await page.locator("html[data-hydrated='true']").waitFor();
		const header = page.locator("header");
		await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

		await page.getByRole("link", { name: "About", exact: true }).click();
		await expect(page).toHaveURL(/\/about$/);
		await expect(header).toHaveCSS("background-color", "rgb(73, 79, 92)");
		await page.getByRole("link", { name: "Photography", exact: true }).click();
		await expect(page).toHaveURL(/\/photography$/);
		await expect(header).toHaveCSS("background-color", "rgb(73, 79, 92)");
	});

	test("renders a home route error with an opaque header", async ({ page }) => {
		await page.goto("/about");
		await page.locator("html[data-hydrated='true']").waitFor();
		await page.route("**/_serverFn/**", (route) =>
			route.fulfill({
				status: 503,
				contentType: "application/json",
				body: JSON.stringify({ error: "home loader failure" }),
			}),
		);

		await page.getByRole("link", { name: "Home", exact: true }).click();
		await expect(
			page.getByRole("heading", { name: "Something went wrong" }),
		).toBeVisible();
		await expect(page.locator("[data-home-hero]")).toHaveCount(0);
		await expect(page.locator("header")).toHaveCSS(
			"background-color",
			"rgb(73, 79, 92)",
		);
		await expect(
			page.getByRole("link", { name: "Home", exact: true }),
		).toBeVisible();
	});
});

test.describe("Reduced motion", () => {
	test("removes nonessential page, dialog, and carousel motion", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");
		await page.locator("html[data-hydrated='true']").waitFor();
		await expect(page.locator("header")).toHaveCSS("transition-duration", "0s");
		await expect(
			page.getByRole("link", { name: "View Photography" }),
		).toHaveCSS("transition-duration", "0s");

		await page
			.getByRole("link", { name: "View Photography", exact: true })
			.click();
		await page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first()
			.click();
		await expect(page.locator("[data-slot='dialog-overlay']")).toHaveCSS(
			"animation-name",
			"none",
		);
		await expect(page.locator("[data-slot='dialog-content']")).toHaveCSS(
			"animation-name",
			"none",
		);

		const dialog = page.getByRole("dialog");
		const track = dialog.locator("[data-slot='carousel-content'] > div");
		await track.evaluate((element: HTMLElement) => {
			element.dataset.movementSamples = "";
			new MutationObserver(() => {
				const samples = element.dataset.movementSamples ?? "";
				element.dataset.movementSamples = `${samples}${element.style.transform}\n`;
			}).observe(element, {
				attributeFilter: ["style"],
				attributes: true,
			});
		});
		await dialog.getByRole("button", { name: "Next slide" }).click();
		await expect(dialog.getByText("2 / 80", { exact: true })).toBeVisible();
		await page.evaluate(
			() =>
				new Promise<void>((resolve) => {
					let frames = 8;
					const waitForFrame = () => {
						frames -= 1;
						if (frames === 0) {
							resolve();
							return;
						}
						requestAnimationFrame(waitForFrame);
					};
					requestAnimationFrame(waitForFrame);
				}),
		);
		const movementSamples = await track.evaluate((element: HTMLElement) =>
			(element.dataset.movementSamples ?? "").split("\n").filter(Boolean),
		);
		expect(movementSamples.length).toBeGreaterThan(0);
		expect(new Set(movementSamples).size).toBe(1);
	});

	test("removes dropdown and sheet motion", {
		tag: "@mobile-only",
	}, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/photography");
		await page.locator("html[data-hydrated='true']").waitFor();
		await page.getByRole("button", { name: "Dance", exact: true }).click();
		await expect(page.locator("[data-slot='dropdown-menu-content']")).toHaveCSS(
			"animation-name",
			"none",
		);
		await page.keyboard.press("Escape");

		await page.getByRole("button", { name: "Open Navigation" }).click();
		await expect(page.locator("[data-slot='sheet-overlay']")).toHaveCSS(
			"animation-name",
			"none",
		);
		await expect(page.locator("[data-slot='sheet-content']")).toHaveCSS(
			"animation-name",
			"none",
		);
	});
});

test.describe("Static route visual states", () => {
	test("prioritizes the above-the-fold About portrait", async ({ page }) => {
		await page.goto("/about");
		const portrait = page.getByAltText("Portrait of Carolyn DiLoreto", {
			exact: true,
		});
		await expect(portrait).toHaveAttribute("fetchpriority", "high");
		await expect(portrait).not.toHaveAttribute("loading", "lazy");
	});

	test("settles after an image node is replaced", async ({ page }) => {
		await page.addInitScript(() => {
			const decode = HTMLImageElement.prototype.decode;
			let replaced = false;
			HTMLImageElement.prototype.decode = function decodeWithReplacement() {
				if (!replaced && this.alt === "Portrait of Carolyn DiLoreto") {
					replaced = true;
					this.replaceWith(this.cloneNode(true));
					return Promise.reject(new Error("Image node was replaced."));
				}
				return decode.call(this);
			};
		});
		await page.goto("/about");

		await settleVisualPage(page, { expectedPath: "/about" });
		await expect(
			page.getByAltText("Portrait of Carolyn DiLoreto", { exact: true }),
		).toBeVisible();
	});

	test("matches the About page viewport", async ({ page }) => {
		await page.goto("/about");
		await settleVisualPage(page, { expectedPath: "/about" });
		await expect(
			page.getByAltText("Portrait of Carolyn DiLoreto", { exact: true }),
		).toBeVisible();
		await expect(page).toHaveScreenshot("about-viewport.png");
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
		await expectFullPageScreenshot(page, "not-found-full-page.png", {
			expectedPath: "/route-that-does-not-exist",
		});
	});

	test("redirects the Resume route to the captured document", async ({
		request,
	}) => {
		const response = await request.get("/resume", { maxRedirects: 0 });
		expect(response.status()).toBe(307);
		expect(response.headers().location).toMatch(
			/2025_Carolyn_DiLoreto_Resume\.pdf$/,
		);
	});
});
