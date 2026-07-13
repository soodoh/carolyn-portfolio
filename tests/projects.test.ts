import { expect, test } from "@playwright/test";
import {
	expectFullPageScreenshot,
	prepareVisualPage,
	selectFilter,
} from "@/tests/visual-helpers";

const projectFilters = ["All", "Design", "Interactive", "Film"];

test.describe("Projects visual states", () => {
	test.beforeEach(async ({ page }) => {
		await prepareVisualPage(page);
	});

	for (const filter of projectFilters) {
		test(`matches the ${filter} filter`, async ({ page }) => {
			await page.goto("/projects");
			if (filter !== projectFilters[0]) {
				await selectFilter(page, projectFilters[0], filter);
			}
			await expectFullPageScreenshot(
				page,
				`projects-filter-${filter.toLowerCase()}.png`,
			);
		});
	}

	test("matches a non-video project", async ({ page }) => {
		await page.goto("/projects/the-voice-app-agt-app");
		await expect(
			page.getByRole("heading", { name: "The Voice App / AGT App" }),
		).toBeVisible();
		await expectFullPageScreenshot(page, "project-non-video.png");
	});

	test("matches a video project", async ({ page }) => {
		await page.goto("/projects/em-body");
		await expect(page.getByTitle("Video Player")).toBeVisible();
		await expectFullPageScreenshot(page, "project-video.png");
	});

	test("matches a protected project before and after authentication", async ({
		page,
	}) => {
		await page.goto("/projects/magnolia-app");
		await expect(
			page.getByRole("heading", { name: "Password Protected" }),
		).toBeVisible();
		await expectFullPageScreenshot(page, "project-auth-gate.png");

		await page
			.getByLabel("Password", { exact: true })
			.fill("playwright-password");
		await page.getByRole("button", { name: "Submit password" }).click();
		await expect(
			page.getByRole("heading", { name: "Magnolia App" }),
		).toBeVisible();
		await expectFullPageScreenshot(page, "project-authenticated.png");
	});
});
