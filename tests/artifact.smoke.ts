import { expect, test } from "@playwright/test";
import { selectFilter } from "@/tests/visual-helpers";

const staticProjectPath = "/projects/d23-membership-page";
const artifactMode = process.env.EXPECTED_ARTIFACT_MODE;
if (artifactMode !== "fixture" && artifactMode !== "production") {
	throw new Error("EXPECTED_ARTIFACT_MODE must be fixture or production");
}
function expectArtifactTarget(
	response: { headers: () => Record<string, string> },
	target: "compute" | "static",
): void {
	expect(response.headers()["x-amplify-artifact-target"]).toBe(target);
}

test.describe("emitted Amplify artifact", () => {
	test("applies persistent clean URLs and preserves emitted routes", async ({
		page,
		request,
	}) => {
		const about = await request.get("/about", { maxRedirects: 0 });
		expect(about.status()).toBe(200);
		expectArtifactTarget(about, "static");
		expect(about.headers()["x-amplify-artifact-route"]).toBe(
			"/about/index.html",
		);
		const aboutSlash = await request.get("/about/?canonical=1", {
			maxRedirects: 0,
		});
		expect(aboutSlash.status()).toBe(301);
		expect(aboutSlash.headers().location).toBe("/about?canonical=1");

		const home = await request.get("/", { maxRedirects: 0 });
		expect(home.status()).toBe(200);
		expectArtifactTarget(home, "static");
		expect(await home.text()).toContain('data-header-appearance="transparent"');

		const project = await request.get(staticProjectPath, { maxRedirects: 0 });
		expect(project.status()).toBe(200);
		expectArtifactTarget(project, "compute");

		await page.goto(staticProjectPath);
		await page.locator("html[data-hydrated='true']").waitFor();
		await expect(
			page.getByRole("heading", { name: "D23 Membership Page" }),
		).toBeVisible();

		const asset = await request.get("/favicon.png", { maxRedirects: 0 });
		expect(asset.status()).toBe(200);
		expectArtifactTarget(asset, "static");
		expect(asset.headers()["x-amplify-artifact-route"]).toBe("/favicon.png");
	});

	test("runs photography server functions through compute with healthy images", async ({
		page,
	}) => {
		const imageResponses = new Map<string, number>();
		page.on("response", (response) => {
			if (response.request().resourceType() === "image") {
				imageResponses.set(response.url(), response.status());
			}
		});
		if (artifactMode === "production") {
			await page.route("https://images.ctfassets.net/**", (route) =>
				route.fulfill({ path: "public/favicon.png", status: 200 }),
			);
		}

		const initial = await page.goto("/photography");
		if (initial) {
			expectArtifactTarget(initial, "static");
		}
		await page.locator("html[data-hydrated='true']").waitFor();
		const responsePromise = page.waitForResponse(
			(response) =>
				response.url().includes("/_serverFn/") &&
				response.request().method() === "POST" &&
				response.request().postData()?.includes("Portraits") === true,
		);
		await selectFilter(page, "Dance", "Portraits");
		const response = await responsePromise;
		expect(response.ok()).toBe(true);
		expect(response.headers()["x-amplify-artifact-target"]).toBe("compute");
		const thumbnails = page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ });
		await expect(thumbnails).toHaveCount(54);
		const representativeImage = thumbnails.first().locator("img");
		await representativeImage.scrollIntoViewIfNeeded();
		await expect
			.poll(() =>
				representativeImage.evaluate(
					(image: HTMLImageElement) =>
						image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
				),
			)
			.toBe(true);
		await representativeImage.evaluate((image: HTMLImageElement) =>
			image.decode(),
		);
		const imageSelection = await representativeImage.evaluate(
			(image: HTMLImageElement) => ({
				intrinsicWidth: Number(image.getAttribute("width")),
				srcsetWidths: image.srcset
					.split(",")
					.map((candidate) => Number(candidate.trim().match(/ (\d+)w$/)?.[1]))
					.filter((candidate) => Number.isFinite(candidate)),
				url: image.currentSrc,
			}),
		);
		expect(Math.max(...imageSelection.srcsetWidths)).toBeLessThanOrEqual(
			imageSelection.intrinsicWidth,
		);
		const imageUrl = imageSelection.url;
		const parsedImageUrl = new URL(imageUrl);
		if (artifactMode === "fixture") {
			expect(parsedImageUrl.origin).toBe(new URL(page.url()).origin);
			expect(parsedImageUrl.pathname).toMatch(/^\/test-assets\//);
		} else {
			expect(parsedImageUrl.hostname).toBe("images.ctfassets.net");
			expect(parsedImageUrl.pathname).not.toContain("test-assets");
		}
		expect(imageResponses.get(imageUrl)).toBe(200);
	});

	test("preserves compute redirects and 404 responses", async ({ request }) => {
		const resume = await request.get("/resume", { maxRedirects: 0 });
		expect(resume.status()).toBe(307);
		expectArtifactTarget(resume, "compute");
		expect(resume.headers().location).toMatch(
			/^https:\/\/[^/]+\.ctfassets\.net\//,
		);

		const missing = await request.get("/not-an-artifact-route", {
			maxRedirects: 0,
		});
		expect(missing.status()).toBe(404);
		expectArtifactTarget(missing, "compute");
		expect(await missing.text()).toContain("Page Not Found");
	});
});
