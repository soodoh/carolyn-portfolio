import { expect, test } from "@playwright/test";
import {
	expectFullPageScreenshot,
	prepareVisualPage,
	selectFilter,
	settleVisualPage,
} from "@/tests/visual-helpers";

const projectFilters = ["All", "Design", "Interactive", "Film"];

test.describe("Projects visual states", () => {
	test.beforeEach(async ({ page }) => {
		await prepareVisualPage(page);
	});

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
			await expectFullPageScreenshot(
				page,
				`projects-filter-${filter.toLowerCase()}.png`,
			);
		});
	}

	test("matches a hovered project thumbnail", { tag: "@desktop-only" }, async ({
		page,
	}) => {
		await page.goto("/projects");
		await settleVisualPage(page);

		const thumbnail = page
			.getByRole("tabpanel")
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
		});
	});

	test("matches a video project", async ({ page }) => {
		await page.goto("/projects/em-body");
		await expect(page.getByTitle("Video Player")).toBeVisible();
		await expectFullPageScreenshot(page, "project-video.png", {
			capture: "page",
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
		});
	});
});
