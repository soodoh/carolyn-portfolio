import { expect, type Locator, type Page } from "@playwright/test";

async function expectImageLoaded(image: Locator): Promise<void> {
	await expect
		.poll(
			() =>
				image.evaluate(
					(element: HTMLImageElement) =>
						element.complete &&
						element.naturalWidth > 0 &&
						getComputedStyle(element).backgroundImage === "none",
				),
			{ timeout: 60_000 },
		)
		.toBe(true);
}

export async function settleVisualPage(page: Page): Promise<void> {
	await page.locator("html[data-hydrated='true']").waitFor();
	await page.waitForLoadState("networkidle");
	await page.evaluate(async () => {
		await Promise.all([
			document.fonts.load('400 16px "Karla"'),
			document.fonts.load('400 16px "Old Standard TT"'),
		]);
		await document.fonts.ready;
	});

	const images = page.locator("img");
	for (let index = 0; index < (await images.count()); index += 1) {
		const image = images.nth(index);
		const isInactiveGalleryImage = await image.evaluate(
			(element) => element.closest("[aria-hidden='true']") !== null,
		);
		if (isInactiveGalleryImage) {
			continue;
		}
		await image.scrollIntoViewIfNeeded();
		await expectImageLoaded(image);
	}

	await page.keyboard.press("Home");
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

type FullPageScreenshotOptions = {
	capture?: "body" | "page";
	mask?: Locator[];
	maskColor?: string;
};

export async function expectFullPageScreenshot(
	page: Page,
	name: string,
	options: FullPageScreenshotOptions = {},
): Promise<void> {
	await settleVisualPage(page);
	const screenshotOptions = {
		fullPage: true,
		mask: options.mask,
		maskColor: options.maskColor,
	};
	if (options.capture === "page") {
		await expect(page).toHaveScreenshot(name, screenshotOptions);
		return;
	}
	await expect(page.locator("body")).toHaveScreenshot(name, {
		mask: options.mask,
		maskColor: options.maskColor,
	});
}

export async function expectStickyFilterBelowHeader(page: Page): Promise<void> {
	const header = page.locator("header");
	const filter = page.locator("[data-visual-sticky-filter]");
	await expect(header).toBeVisible();
	await expect(filter).toBeVisible();
	await expect(filter).toHaveCSS("position", "sticky");
	const [headerBox, filterBox] = await Promise.all([
		header.boundingBox(),
		filter.boundingBox(),
	]);
	if (!headerBox || !filterBox) {
		throw new Error("Sticky filter geometry is unavailable.");
	}
	expect(filterBox.y).toBeCloseTo(headerBox.y + headerBox.height, 1);

	const mobileTrigger = filter.locator("[data-slot='dropdown-menu-trigger']");
	if (await mobileTrigger.isVisible()) {
		await expect(filter).toHaveCSS("padding-top", "8px");
		await expect(filter).toHaveCSS("padding-bottom", "24px");
		const triggerBox = await mobileTrigger.boundingBox();
		if (!triggerBox) {
			throw new Error("Mobile filter geometry is unavailable.");
		}
		expect(triggerBox.y - filterBox.y).toBeCloseTo(8, 1);
		expect(
			filterBox.y + filterBox.height - (triggerBox.y + triggerBox.height),
		).toBeCloseTo(24, 1);
	}
}

export async function expectFilterFocusWithoutOutline(
	page: Page,
	filter: string,
): Promise<void> {
	const desktopFilter = page.getByRole("button", {
		name: `Choose filter: ${filter}`,
	});
	const isDesktopFilter = await desktopFilter.isVisible();
	const control = isDesktopFilter
		? desktopFilter
		: page.getByRole("button", { name: filter, exact: true });
	await page.keyboard.press("Tab");
	await control.focus();
	await expect(control).toBeFocused();
	expect(
		await control.evaluate((element) => element.matches(":focus-visible")),
	).toBe(true);
	await expect(control).toHaveCSS("outline-style", "none");
	await expect(control).toHaveCSS("box-shadow", "none");
	if (isDesktopFilter) {
		await expect(control).toHaveCSS("border-top-width", "0px");
		await expect(control).toHaveCSS("border-right-width", "0px");
		await expect(control).toHaveCSS("border-bottom-width", "0px");
		await expect(control).toHaveCSS("border-left-width", "0px");
	}
}

export async function expectDesktopFilterIndicator(
	page: Page,
	filter: string,
): Promise<void> {
	const selectedFilter = page.getByRole("button", {
		name: `Choose filter: ${filter}`,
	});
	if (!(await selectedFilter.isVisible())) {
		return;
	}

	await expect(page.locator("[data-visual-sticky-filter]")).toHaveCSS(
		"z-index",
		"3",
	);
	const indicator = selectedFilter.locator("[data-selected-filter-indicator]");
	await expect(indicator).toBeVisible();
	await expect(indicator).toHaveCSS("height", "5px");
	await expect(indicator).toHaveCSS("background-color", "rgb(206, 192, 168)");
	const [headerBox, indicatorBox] = await Promise.all([
		page.locator("header").boundingBox(),
		indicator.boundingBox(),
	]);
	if (!headerBox || !indicatorBox) {
		throw new Error("Desktop filter indicator geometry is unavailable.");
	}
	expect(indicatorBox.y).toBeCloseTo(headerBox.y + headerBox.height - 5, 1);
	expect(
		await page.evaluate(
			({ x, y }) =>
				document
					.elementFromPoint(x, y)
					?.hasAttribute("data-selected-filter-indicator") ?? false,
			{
				x: indicatorBox.x + indicatorBox.width / 2,
				y: indicatorBox.y + indicatorBox.height / 2,
			},
		),
	).toBe(true);
}

export async function selectFilter(
	page: Page,
	current: string,
	next: string,
): Promise<void> {
	await page.locator("html[data-hydrated='true']").waitFor();
	const filterButton = page.getByRole("button", {
		name: `Choose filter: ${next}`,
	});
	if (await filterButton.isVisible()) {
		await expect(async () => {
			await filterButton.click();
			await expect(filterButton).toHaveAttribute("aria-pressed", "true", {
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
	await expect(page.locator("[aria-busy='true']")).toHaveCount(0);
}
