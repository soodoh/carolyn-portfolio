import { expect, test } from "@/tests/playwright";
import {
	expectCurrentPath,
	expectDesktopFilterIndicator,
	expectFilterKeyboardFocus,
	expectFullPageScreenshot,
	expectStickyFilterBelowHeader,
	selectFilter,
	settleVisualPage,
	tabToTarget,
	waitForHydration,
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
				{ expectedPath: "/projects" },
			);
		});
	}

	test("prioritizes only the leading project and detail covers", async ({
		page,
	}) => {
		await page.goto("/projects");
		const projectImages = page.locator(".masonry-grid img");
		await expect(projectImages.first()).toHaveAttribute(
			"fetchpriority",
			"high",
		);
		await expect(projectImages.first()).not.toHaveAttribute("loading", "lazy");
		await expect(projectImages.nth(1)).toHaveAttribute("loading", "lazy");

		await page.goto("/");
		const homeProjectImages = page.locator(".masonry-grid img");
		await expect(homeProjectImages.first()).toHaveAttribute("loading", "lazy");
		await expect(homeProjectImages.first()).not.toHaveAttribute(
			"fetchpriority",
			"high",
		);

		await page.goto("/projects/the-voice-app-agt-app");
		const cover = page.locator("section img").first();
		await expect(cover).toHaveAttribute("fetchpriority", "high");
		await expect(cover).not.toHaveAttribute("loading", "lazy");
	});

	test("matches a scrolled projects filter", async ({ page }) => {
		await page.goto("/projects");
		await selectFilter(page, "All", "Design");
		await settleVisualPage(page, { expectedPath: "/projects" });
		await page
			.locator(".masonry-grid")
			.getByRole("link")
			.nth(4)
			.scrollIntoViewIfNeeded();
		await expectCurrentPath(page, "/projects");
		await expectStickyFilterBelowHeader(page);
		await expect(page).toHaveScreenshot("projects-filter-design-scrolled.png");
	});

	test("shows keyboard focus in filter order", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		await page.goto("/projects");
		await waitForHydration(page);
		await expectFilterKeyboardFocus(page, "All");
		await page.keyboard.press("Tab");
		await expect(
			page.getByRole("button", { name: "Choose filter: Design" }),
		).toBeFocused();
	});

	test("reveals project metadata on keyboard focus", {
		tag: "@desktop-only",
	}, async ({ page }) => {
		await page.goto("/projects");
		await waitForHydration(page);
		const thumbnail = page
			.locator(".masonry-grid")
			.getByRole("link", { name: /Magnolia App/ });
		await tabToTarget(page, page.locator("footer a").first(), thumbnail, {
			direction: "backward",
			maxTabs: 25,
			targetName: "Magnolia App project",
		});
		await expect(thumbnail).toBeFocused();
		await expect(
			thumbnail.getByRole("heading", { name: "Magnolia App" }),
		).toBeVisible();
	});

	test("shows keyboard focus on the mobile filter menu", {
		tag: "@mobile-only",
	}, async ({ page }) => {
		await page.goto("/projects");
		await waitForHydration(page);
		const trigger = page.getByRole("button", { name: "All", exact: true });
		await tabToTarget(
			page,
			page.locator(".masonry-grid").getByRole("link").first(),
			trigger,
			{
				direction: "backward",
				maxTabs: 5,
				targetName: "mobile project filter",
			},
		);
		expect(
			await trigger.evaluate((element) => element.matches(":focus-visible")),
		).toBe(true);
		await expect(trigger).toHaveCSS("outline-style", "solid");
		await expect(trigger).toHaveCSS("outline-width", "2px");

		await page.keyboard.press("Enter");
		const firstMenuItem = page.getByRole("menuitem", {
			name: "All",
			exact: true,
		});
		await expect(firstMenuItem).toBeFocused();
		await expect(firstMenuItem).toHaveAttribute("data-highlighted");
	});

	test("matches a hovered project thumbnail", { tag: "@desktop-only" }, async ({
		page,
	}) => {
		await page.goto("/projects");
		await settleVisualPage(page, { expectedPath: "/projects" });

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
		await expectCurrentPath(page, "/projects");
		await expect(thumbnail).toHaveScreenshot("project-thumbnail-hover.png");
	});

	test("matches a non-video project", async ({ page }) => {
		await page.goto("/projects/the-voice-app-agt-app");
		await expect(
			page.getByRole("heading", { name: "The Voice App / AGT App" }),
		).toBeVisible();
		await expectFullPageScreenshot(page, "project-non-video.png", {
			expectedPath: "/projects/the-voice-app-agt-app",
			capture: "page",
			mask: [page.locator('img[src*=".gif"]:not([src*="/hermetic-build/"])')],
			maskColor: "#111",
		});
	});

	test("configures Vimeo and YouTube embeds for playback", async ({ page }) => {
		for (const project of [
			{ path: "/projects/em-body", origin: "https://player.vimeo.com" },
			{ path: "/projects/plantum", origin: "https://www.youtube.com" },
		]) {
			await page.goto(project.path);
			const videoPlayer = page.getByTitle("Video Player");
			await expect(videoPlayer).toBeVisible();
			await expect(videoPlayer).toHaveAttribute(
				"sandbox",
				"allow-scripts allow-same-origin allow-presentation allow-popups",
			);
			await expect(videoPlayer).toHaveAttribute(
				"referrerpolicy",
				"strict-origin-when-cross-origin",
			);
			await expect(videoPlayer).toHaveAttribute(
				"allow",
				"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; fullscreen; picture-in-picture; web-share",
			);
			const source = await videoPlayer.getAttribute("src");
			if (!source) {
				throw new Error("Video player is missing its source URL.");
			}
			expect(new URL(source).origin).toBe(project.origin);
		}
	});

	test("matches a video project", async ({ page }) => {
		await page.goto("/projects/em-body");
		const videoPlayer = page.getByTitle("Video Player");
		await expect(videoPlayer).toBeVisible();
		await expectFullPageScreenshot(page, "project-video.png", {
			expectedPath: "/projects/em-body",
			capture: "page",
			mask: [videoPlayer],
			maskColor: "#111",
		});
	});

	test("matches a protected project before and after authentication", async ({
		page,
	}) => {
		const gateResponse = await page.goto("/projects/magnolia-app");
		if (!gateResponse) {
			throw new Error("Protected project navigation returned no response.");
		}
		const gateBody = await gateResponse.text();
		expect(gateBody).not.toContain("Product Designer");
		expect(gateBody).not.toContain("Multi-Platform App");
		await expect(
			page.getByRole("heading", { name: "Password Protected" }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Magnolia App" }),
		).toHaveCount(0);
		await expectFullPageScreenshot(page, "project-auth-gate.png", {
			expectedPath: "/projects/magnolia-app",
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
			expectedPath: "/projects/magnolia-app",
			capture: "page",
			mask: [
				page.getByTitle("Video Player"),
				page.locator('img[src*=".gif"]:not([src*="/hermetic-build/"])'),
			],
			maskColor: "#111",
		});
	});
});
