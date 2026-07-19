import { expect, test } from "@playwright/test";
import {
	expectDesktopFilterIndicator,
	expectFilterFocusWithoutOutline,
	expectFullPageScreenshot,
	expectStickyFilterBelowHeader,
	selectFilter,
	settleVisualPage,
} from "@/tests/visual-helpers";

const projectFilters = ["All", "Design", "Interactive", "Film"] as const;
const projectFilterExpectations = {
	All: { count: 15, included: "Magnolia App" },
	Design: { count: 10, included: "NBC App", excluded: "Em/body" },
	Interactive: { count: 4, included: "Em/body", excluded: "NBC App" },
	Film: { count: 3, included: "Shed", excluded: "Magnolia App" },
} as const;

test.describe("Projects visual states", () => {
	for (const filter of projectFilters) {
		test(`matches the ${filter} filter`, async ({ page }) => {
			await page.goto("/projects");
			const mobileFilter = page.getByRole("button", {
				name: projectFilters[0],
				exact: true,
			});
			if (await mobileFilter.isVisible()) {
				await expect(mobileFilter).toHaveCSS("padding", "4px 8px");
			}
			if (filter !== projectFilters[0]) {
				await selectFilter(page, projectFilters[0], filter);
			}
			await expectDesktopFilterIndicator(page, filter);
			await expectFilterFocusWithoutOutline(page, filter);
			const expectation = projectFilterExpectations[filter];
			const projectGrid = page.locator(".masonry-grid");
			await expect(projectGrid.getByRole("link")).toHaveCount(
				expectation.count,
			);
			await expect(
				projectGrid.getByRole("link", {
					name: new RegExp(expectation.included),
				}),
			).toBeVisible();
			if ("excluded" in expectation) {
				await expect(
					projectGrid.getByRole("link", {
						name: new RegExp(expectation.excluded),
					}),
				).toHaveCount(0);
			}
			await expectFullPageScreenshot(
				page,
				`projects-filter-${filter.toLowerCase()}.png`,
			);
		});
	}

	test("matches a scrolled projects filter", async ({ page }) => {
		await page.goto("/projects");
		await selectFilter(page, "All", "Design");
		await settleVisualPage(page);
		await expectFilterFocusWithoutOutline(page, "Design");
		await page
			.locator(".masonry-grid")
			.getByRole("link")
			.nth(4)
			.scrollIntoViewIfNeeded();
		await expectStickyFilterBelowHeader(page);
		await expect(page).toHaveScreenshot("projects-filter-design-scrolled.png");
	});

	test("matches a hovered project thumbnail", { tag: "@desktop-only" }, async ({
		page,
	}) => {
		await page.goto("/projects");
		await settleVisualPage(page);

		const thumbnail = page
			.locator(".masonry-grid")
			.getByRole("link", { name: /Magnolia App/ });
		await thumbnail.hover();
		await expect(
			thumbnail.getByRole("heading", { name: "Magnolia App" }),
		).toBeVisible();
		await expect(
			thumbnail.getByRole("heading", { name: "Multi-Platform App" }),
		).toBeVisible();
		await expect(thumbnail).toHaveScreenshot("project-thumbnail-hover.png");
	});

	test("matches a non-video project", async ({ page }) => {
		await page.goto("/projects/the-voice-app-agt-app");
		await expect(
			page.getByRole("heading", { name: "The Voice App / AGT App" }),
		).toBeVisible();
		await expectFullPageScreenshot(page, "project-non-video.png", {
			capture: "page",
			mask: [page.locator('img[src*=".gif"]')],
			maskColor: "#111",
		});
	});

	test("matches a video project", async ({ page }) => {
		await page.goto("/projects/em-body");
		await expect(page.getByTitle("Video Player")).toBeVisible();
		await expectFullPageScreenshot(page, "project-video.png", {
			capture: "page",
			mask: [page.getByTitle("Video Player")],
			maskColor: "#111",
		});
	});

	test("matches a protected project before and after authentication", async ({
		page,
	}) => {
		await page.goto("/projects/magnolia-app");
		await expect(
			page.getByRole("heading", { name: "Password Protected" }),
		).toBeVisible();
		await expectFullPageScreenshot(page, "project-auth-gate.png", {
			capture: "page",
		});

		await page
			.getByLabel("Password", { exact: true })
			.fill("playwright-password");
		await page.getByRole("button", { name: "Submit password" }).click();
		await expect(
			page.getByRole("heading", { name: "Magnolia App" }),
		).toBeVisible();
		await expectFullPageScreenshot(page, "project-authenticated.png", {
			capture: "page",
			mask: [page.locator('img[src*=".gif"]')],
			maskColor: "#111",
		});
	});
});
