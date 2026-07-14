import { expect, type Locator, type Page } from "@playwright/test";

export async function prepareVisualPage(page: Page): Promise<void> {
	await page.route(/ctfassets.*\.gif/i, async (route) => {
		const url = new URL(route.request().url());
		url.searchParams.set("fm", "jpg");
		await route.continue({ url: url.toString() });
	});
	await page.route(
		/(player\.vimeo\.com|youtube\.com\/embed)/i,
		async (route) => {
			await route.fulfill({
				contentType: "text/html",
				body: '<!doctype html><html><body style="margin:0;background:#111"></body></html>',
			});
		},
	);
}

export async function settleVisualPage(page: Page): Promise<void> {
	await page.locator("html[data-hydrated='true']").waitFor();
	await page.waitForLoadState("networkidle");
	await page.addStyleTag({
		content: "section.sticky { position: static !important; }",
	});
	await page.evaluate(() => {
		for (const image of document.querySelectorAll<HTMLImageElement>("img")) {
			image.loading = "eager";
		}
	});
	await page.evaluate(async () => {
		await Promise.all([
			document.fonts.load('400 16px "Karla"'),
			document.fonts.load('400 16px "Old Standard TT"'),
		]);
		await document.fonts.ready;
		const step = Math.max(window.innerHeight - 100, 100);
		for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
			window.scrollTo(0, y);
			await new Promise((resolve) => window.setTimeout(resolve, 25));
		}
		window.scrollTo(0, 0);
	});
	await expect
		.poll(
			async () =>
				page.evaluate(() =>
					[...document.images].every(
						(image) => image.complete && image.naturalWidth > 0,
					),
				),
			{ timeout: 60_000 },
		)
		.toBe(true);
	await page.evaluate(async () => {
		for (const image of document.images) {
			const source = new URL(image.currentSrc || image.src);
			if (source.pathname.startsWith("/test-assets/")) {
				source.search = "";
			}
			image.removeAttribute("srcset");
			image.removeAttribute("sizes");
			image.src = source.toString();
		}
		await Promise.allSettled(
			[...document.images].map((image) => image.decode()),
		);
	});
	await expect
		.poll(() =>
			page.evaluate(() =>
				[...document.images].every(
					(image) =>
						image.complete &&
						image.naturalWidth > 0 &&
						getComputedStyle(image).backgroundImage === "none",
				),
			),
		)
		.toBe(true);
	await page.waitForTimeout(1_000);
}

type FullPageScreenshotOptions = {
	capture?: "body" | "page";
	fixedBackground?: Locator;
};

export async function expectFullPageScreenshot(
	page: Page,
	name: string,
	options: FullPageScreenshotOptions = {},
): Promise<void> {
	await settleVisualPage(page);
	if (options.fixedBackground) {
		const pageHeight = await page.evaluate(
			() => document.documentElement.scrollHeight,
		);
		await options.fixedBackground.evaluate((element, height) => {
			element.style.position = "absolute";
			element.style.height = `${height}px`;
		}, pageHeight);
	}
	if (options.capture === "page") {
		await expect(page).toHaveScreenshot(name, { fullPage: true });
		return;
	}
	await expect(page.locator("body")).toHaveScreenshot(name);
}

export async function selectFilter(
	page: Page,
	current: string,
	next: string,
): Promise<void> {
	await page.locator("html[data-hydrated='true']").waitFor();
	const tab = page.getByRole("tab", { name: `Choose filter: ${next}` });
	if (await tab.isVisible()) {
		await expect(async () => {
			await tab.click();
			await expect(tab).toHaveAttribute("aria-selected", "true", {
				timeout: 1_000,
			});
		}).toPass({ timeout: 30_000 });
	} else {
		const button = page.getByRole("button", { name: current, exact: true });
		const menuItem = page.getByRole("menuitem", { name: next, exact: true });
		await expect(async () => {
			await button.click();
			await expect(menuItem).toBeVisible({ timeout: 1_000 });
		}).toPass({ timeout: 30_000 });
		await menuItem.click();
		await expect(
			page.getByRole("button", { name: next, exact: true }),
		).toBeVisible();
	}
	await expect(page.getByRole("tabpanel")).toBeVisible();
	await page.waitForTimeout(300);
}
