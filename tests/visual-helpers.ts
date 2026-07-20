import { expect, type Locator, type Page } from "@playwright/test";

function parseCssColor(color: string): [number, number, number, number] {
	const channels = color.match(/[\d.]+/g)?.map(Number);
	if (!channels || channels.length < 3) {
		throw new Error(`Unable to parse CSS color: ${color}`);
	}
	return [channels[0], channels[1], channels[2], channels[3] ?? 1];
}

function relativeLuminance([red, green, blue]: number[]): number {
	const [linearRed, linearGreen, linearBlue] = [red, green, blue].map(
		(channel) => {
			const normalized = channel / 255;
			return normalized <= 0.04045
				? normalized / 12.92
				: ((normalized + 0.055) / 1.055) ** 2.4;
		},
	);
	return 0.2126 * linearRed + 0.7152 * linearGreen + 0.0722 * linearBlue;
}

async function resolveComputedColor(
	locator: Locator,
	property: "backgroundColor" | "color",
): Promise<[number, number, number, number]> {
	return locator.evaluate((element, colorProperty) => {
		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error("Unable to resolve computed color.");
		}
		context.clearRect(0, 0, 1, 1);
		context.fillStyle = getComputedStyle(element)[colorProperty];
		context.fillRect(0, 0, 1, 1);
		const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
		return [red, green, blue, alpha / 255];
	}, property);
}

export async function expectControlContrast(
	control: Locator,
	surface: Locator,
	minimumContrast = 3,
): Promise<void> {
	const [controlColor, surfaceColor] = await Promise.all([
		resolveComputedColor(control, "color"),
		resolveComputedColor(surface, "backgroundColor"),
	]);
	const [surfaceRed, surfaceGreen, surfaceBlue, surfaceAlpha] = surfaceColor;
	const paintedSurface = [surfaceRed, surfaceGreen, surfaceBlue].map(
		(channel) => channel * surfaceAlpha + 255 * (1 - surfaceAlpha),
	);
	const [controlRed, controlGreen, controlBlue, controlAlpha] = controlColor;
	const paintedControl = [controlRed, controlGreen, controlBlue].map(
		(channel, index) =>
			channel * controlAlpha + paintedSurface[index] * (1 - controlAlpha),
	);
	const controlLuminance = relativeLuminance(paintedControl);
	const surfaceLuminance = relativeLuminance(paintedSurface);
	const contrast =
		(Math.max(controlLuminance, surfaceLuminance) + 0.05) /
		(Math.min(controlLuminance, surfaceLuminance) + 0.05);
	expect(contrast).toBeGreaterThanOrEqual(minimumContrast);
}

export async function expectDarkSurfaceFocus(control: Locator): Promise<void> {
	await control.press("Tab");
	await control.focus();
	expect(
		await control.evaluate((element) => element.matches(":focus-visible")),
	).toBe(true);
	await expect(control).toHaveCSS("outline-style", "solid");
	await expect(control).toHaveCSS("outline-width", "2px");
	await expect(control).toHaveCSS("outline-offset", "2px");
	await expect(control).toHaveCSS("outline-color", "rgb(255, 255, 255)");
	const computedColors = await control.evaluate((element) => {
		let surface = element.parentElement;
		while (surface) {
			const backgroundColor = getComputedStyle(surface).backgroundColor;
			if (backgroundColor !== "rgba(0, 0, 0, 0)") {
				return {
					backgroundColor,
					outlineColor: getComputedStyle(element).outlineColor,
				};
			}
			surface = surface.parentElement;
		}
		throw new Error("Dark focus control has no painted ancestor surface.");
	});
	const [red, green, blue, alpha] = parseCssColor(
		computedColors.backgroundColor,
	);
	const surface = [red, green, blue].map(
		(channel) => channel * alpha + 255 * (1 - alpha),
	);
	const outlineLuminance = relativeLuminance(
		parseCssColor(computedColors.outlineColor),
	);
	const surfaceLuminance = relativeLuminance(surface);
	const contrast =
		(Math.max(outlineLuminance, surfaceLuminance) + 0.05) /
		(Math.min(outlineLuminance, surfaceLuminance) + 0.05);
	expect(contrast).toBeGreaterThanOrEqual(3);
}

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
			{ timeout: 20_000 },
		)
		.toBe(true);
}

async function decodeImage(image: Locator): Promise<void> {
	const element = await image.elementHandle();
	try {
		await image.evaluate((current: HTMLImageElement) => current.decode());
	} catch (error) {
		const wasReplaced = element
			? !(await element.evaluate((current) => current.isConnected))
			: false;
		if (!wasReplaced) {
			throw error;
		}
		await expectImageLoaded(image);
		await image.evaluate((current: HTMLImageElement) => current.decode());
	}
}

export async function expectCurrentPath(
	page: Page,
	expectedPath: string,
): Promise<void> {
	await expect.poll(() => new URL(page.url()).pathname).toBe(expectedPath);
}

export async function waitForHydration(page: Page): Promise<void> {
	await page.locator("html[data-hydrated='true']").waitFor();
}

type VisualReadinessOptions = {
	expectedPath: string;
	images?: () => Locator;
	album?: string;
};

async function expectVisualState(
	page: Page,
	options: VisualReadinessOptions,
): Promise<void> {
	await expectCurrentPath(page, options.expectedPath);
	if (options.album) {
		await expect(page.locator("[data-photography-album]")).toHaveAttribute(
			"data-photography-album",
			options.album,
		);
	}
}

async function settleVisualAttempt(
	page: Page,
	options: VisualReadinessOptions,
): Promise<void> {
	await expectVisualState(page, options);
	await waitForHydration(page);
	await page.evaluate(async () => {
		await Promise.all([
			document.fonts.load('400 16px "Karla"'),
			document.fonts.load('400 16px "Old Standard TT"'),
		]);
		await document.fonts.ready;
	});

	const getImages = options.images ?? (() => page.locator("img"));
	const imageCount = await getImages().count();
	for (let index = 0; index < imageCount; index += 1) {
		const image = getImages().nth(index);
		if (!(await image.isVisible())) {
			continue;
		}
		const isInactiveGalleryImage = await image.evaluate(
			(element) => element.closest("[aria-hidden='true']") !== null,
		);
		if (isInactiveGalleryImage) {
			continue;
		}
		await image.scrollIntoViewIfNeeded();
		await expectImageLoaded(image);
		await decodeImage(image);
	}

	await page.evaluate(() => window.scrollTo(0, 0));
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
	await page.evaluate(async () => {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => resolve()),
		);
	});
	await expectVisualState(page, options);
}

export async function settleVisualPage(
	page: Page,
	options: VisualReadinessOptions,
): Promise<void> {
	await settleVisualAttempt(page, options);
}

type FullPageScreenshotOptions = {
	expectedPath: string;
	capture?: "body" | "page";
	mask?: Locator[];
	maskColor?: string;
};

export async function expectFullPageScreenshot(
	page: Page,
	name: string,
	options: FullPageScreenshotOptions,
): Promise<void> {
	const readiness = { expectedPath: options.expectedPath };
	await settleVisualPage(page, readiness);
	await expectVisualState(page, readiness);
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

export async function tabToTarget(
	page: Page,
	start: Locator,
	target: Locator,
	options: {
		direction: "forward" | "backward";
		maxTabs: number;
		targetName: string;
	},
): Promise<void> {
	await start.focus();
	const key = options.direction === "forward" ? "Tab" : "Shift+Tab";
	for (let count = 1; count <= options.maxTabs; count += 1) {
		await page.keyboard.press(key);
		if (
			await target.evaluate((element) => element === document.activeElement)
		) {
			return;
		}
	}
	const activeElement = await page.evaluate(
		() =>
			document.activeElement?.getAttribute("aria-label") ??
			document.activeElement?.textContent?.trim() ??
			document.activeElement?.tagName ??
			"unknown",
	);
	throw new Error(
		`Keyboard focus did not reach ${options.targetName} after ${options.maxTabs} ${options.direction} tabs; active element: ${activeElement}`,
	);
}

export async function expectFilterKeyboardFocus(
	page: Page,
	filter: string,
): Promise<void> {
	const desktopFilter = page.getByRole("button", {
		name: `Choose filter: ${filter}`,
	});
	const control = (await desktopFilter.isVisible())
		? desktopFilter
		: page.getByRole("button", { name: filter, exact: true });
	await tabToTarget(
		page,
		page.locator(".masonry-grid a, .masonry-grid button").first(),
		control,
		{
			direction: "backward",
			maxTabs: 10,
			targetName: `${filter} filter`,
		},
	);

	await expect(control).toBeFocused();
	expect(
		await control.evaluate((element) => element.matches(":focus-visible")),
	).toBe(true);
	await expect(control).toHaveCSS("outline-style", "solid");
	await expect(control).toHaveCSS("outline-width", "2px");
	await expect(control).toHaveCSS("outline-color", "rgb(73, 79, 92)");
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
	await waitForHydration(page);
	const filterButton = page.getByRole("button", {
		name: `Choose filter: ${next}`,
	});
	if (await filterButton.isVisible()) {
		await filterButton.click();
		await expect(filterButton).toHaveAttribute("aria-pressed", "true");
	} else {
		const button = page.getByRole("button", { name: current, exact: true });
		const menuItem = page.getByRole("menuitem", { name: next, exact: true });
		await button.click();
		await expect(menuItem).toBeVisible();
		await menuItem.click();
		await expect(
			page.getByRole("button", { name: next, exact: true }),
		).toBeVisible();
	}
	await expect(page.locator("[aria-busy='true']")).toHaveCount(0);
}
