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
	await expect(page).toHaveScreenshot(name, { fullPage: true });
}

export async function selectFilter(
	page: Page,
	current: string,
	next: string,
): Promise<void> {
	const tab = page.getByRole("tab", { name: `Choose filter: ${next}` });
	if (await tab.isVisible()) {
		await tab.click();
	} else {
		await page.getByRole("button", { name: current, exact: true }).click();
		await page.getByRole("menuitem", { name: next, exact: true }).click();
	}
	await expect(page.getByRole("tabpanel")).toBeVisible();
	await page.waitForTimeout(300);
}
