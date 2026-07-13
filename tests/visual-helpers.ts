import { expect, type Page } from "@playwright/test";

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
	await page.addStyleTag({
		content: "section.sticky { position: static !important; }",
	});
	await page.evaluate(async () => {
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
			const source = image.src;
			image.removeAttribute("srcset");
			image.removeAttribute("sizes");
			image.src = source;
		}
		await Promise.allSettled(
			[...document.images].map((image) => image.decode()),
		);
	});
	await page.waitForTimeout(1_000);
}

export async function expectFullPageScreenshot(
	page: Page,
	name: string,
): Promise<void> {
	await settleVisualPage(page);
	const isTallDesktopPhotographyGrid =
		name.startsWith("photography-filter-") &&
		(await page.evaluate(() => window.innerWidth >= 1024));
	if (isTallDesktopPhotographyGrid) {
		if (name === "photography-filter-dance.png") {
			await page.evaluate(() => {
				document.body.style.minHeight = `${Math.ceil(
					document.body.getBoundingClientRect().height,
				)}px`;
			});
		}
		await expect(async () => {
			await page.evaluate(async () => {
				window.scrollTo(0, document.documentElement.scrollHeight);
				await new Promise((resolve) => requestAnimationFrame(resolve));
				window.scrollTo(0, 0);
				await new Promise((resolve) => requestAnimationFrame(resolve));
			});
			await expect(page).toHaveScreenshot(name, {
				fullPage: true,
				maxDiffPixelRatio: 0.04,
				timeout: 5_000,
			});
		}).toPass({ timeout: 30_000 });
		return;
	}
	await expect(page).toHaveScreenshot(name, { fullPage: true });
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
