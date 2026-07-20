import { type APIRequestContext, expect, test } from "@playwright/test";
import { selectFilter } from "@/tests/visual-helpers";

const canonicalOrigin = "https://carolyndiloreto.com";
const legacyOrigin = "https://carolyn.diloreto.com";
const publicProjectPath = "/projects/d23-membership-page";
const protectedSlug = "magnolia-app";
const defaultOrigin = process.env.AMPLIFY_DEFAULT_ORIGIN;
const expectedReleaseCommit = process.env.AMPLIFY_EXPECTED_RELEASE_COMMIT;

const publicPaths = [
	"/",
	"/about",
	"/projects",
	"/photography",
	publicProjectPath,
];

async function getRootReleaseCommit(
	request: APIRequestContext,
	origin: string,
): Promise<string> {
	const response = await request.get(origin, { maxRedirects: 0 });
	expect(response.status(), origin).toBe(200);
	expect(new URL(response.url()).origin, origin).toBe(new URL(origin).origin);
	const html = await response.text();
	expect(html, `${origin} root response`).toContain(
		"<title>CD Portfolio</title>",
	);
	const releaseCommit = html.match(
		/<meta name="release-commit" content="([a-f0-9]{40})"\/?\s*>/,
	)?.[1];
	expect(releaseCommit, `${origin} release commit`).toBeDefined();
	if (!releaseCommit) {
		throw new Error(`${origin} is missing its release commit marker.`);
	}
	return releaseCommit;
}

test.describe("Amplify production behavior", () => {
	test("serves public routes and assets", async ({ request }) => {
		for (const path of publicPaths) {
			const response = await request.get(path, { maxRedirects: 0 });
			expect(response.status(), path).toBe(200);
			expect(new URL(response.url()).origin, path).toBe(canonicalOrigin);
			const body = await response.text();
			expect(body, path).not.toMatch(/\$2[aby]\$\d{2}\$/);
		}

		const rootHtml = await (await request.get("/")).text();
		const assetPath = rootHtml.match(/src="(\/assets\/[^"]+\.js)"/)?.[1];
		expect(assetPath).toBeDefined();
		if (assetPath) {
			expect((await request.get(assetPath)).status()).toBe(200);
		}
	});

	test("keeps protected content gated and rejects invalid passwords", async ({
		page,
		request,
	}) => {
		const unauthorized = await request.get(`/projects/${protectedSlug}`, {
			maxRedirects: 0,
		});
		expect(new URL(unauthorized.url()).origin).toBe(canonicalOrigin);
		expect(unauthorized.status()).toBe(200);
		expect(unauthorized.headers()["cache-control"]).toBe("private, no-store");
		const unauthorizedHtml = await unauthorized.text();
		expect(unauthorizedHtml).not.toContain("Magnolia App");
		expect(unauthorizedHtml).not.toMatch(/\$2[aby]\$\d{2}\$/);

		await page.goto(`/projects/${protectedSlug}`);
		await page.locator("html[data-hydrated='true']").waitFor();
		const passwordInput = page.getByLabel("Password", { exact: true });
		await passwordInput.fill("incorrect-amplify-smoke-password");
		await page.getByRole("button", { name: "Submit password" }).click();
		await expect(
			page.getByText("The password you entered is incorrect."),
		).toBeVisible();
	});

	test("loads photography albums through a server function", async ({
		page,
	}) => {
		const initialResponse = await page.goto("/photography");
		expect(initialResponse?.status()).toBe(200);
		await page.locator("html[data-hydrated='true']").waitFor();
		const responsePromise = page.waitForResponse((response) => {
			const request = response.request();
			return (
				request.method() === "POST" &&
				response.url().includes("/_serverFn/") &&
				request.postData()?.includes("Portraits") === true
			);
		});
		await selectFilter(page, "Dance", "Portraits");
		const albumResponse = await responsePromise;
		expect(albumResponse.ok()).toBe(true);
		expect(await albumResponse.text()).toContain("Portraits");
		const firstPortrait = page
			.locator(".masonry-grid")
			.getByRole("button", { name: /View fullscreen photo/ })
			.first();
		await expect(firstPortrait).toBeVisible();
		const portraitImage = firstPortrait.locator("img");
		await expect(portraitImage).toHaveAttribute(
			"src",
			/^https:\/\/images\.ctfassets\.net\//,
		);
		await expect
			.poll(() =>
				portraitImage.evaluate(
					(image: HTMLImageElement) =>
						image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
				),
			)
			.toBe(true);
		await portraitImage.evaluate((image: HTMLImageElement) => image.decode());
	});

	test("returns the dynamic resume redirect and a real 404", async ({
		request,
	}) => {
		const resume = await request.get("/resume", { maxRedirects: 0 });
		expect(resume.status()).toBe(307);
		const location = resume.headers().location;
		expect(location).toMatch(/^https:\/\/[^/]+\.ctfassets\.net\//);

		const missing = await request.get("/not-a-real-amplify-route", {
			maxRedirects: 0,
		});
		expect(new URL(missing.url()).origin).toBe(canonicalOrigin);
		expect(missing.status()).toBe(404);
		expect(await missing.text()).toContain("Page Not Found");
	});

	test("preserves paths and queries when redirecting domain aliases", async ({
		request,
	}) => {
		const path = "/projects?redirect-smoke=1";
		for (const origin of [`https://www.carolyndiloreto.com`, legacyOrigin]) {
			const response = await request.get(`${origin}${path}`, {
				maxRedirects: 0,
			});
			expect(response.status(), origin).toBe(301);
			expect(response.headers().location, origin).toBe(
				`${canonicalOrigin}${path}`,
			);
		}
	});

	test("serves the expected release from canonical and default origins", async ({
		request,
	}) => {
		test.skip(!defaultOrigin, "AMPLIFY_DEFAULT_ORIGIN is not configured");
		if (!defaultOrigin) {
			return;
		}
		const [canonicalCommit, defaultCommit] = await Promise.all([
			getRootReleaseCommit(request, canonicalOrigin),
			getRootReleaseCommit(request, defaultOrigin),
		]);
		expect(defaultCommit).toBe(canonicalCommit);
		if (process.env.CI) {
			expect(canonicalCommit).toBe(expectedReleaseCommit);
		} else if (expectedReleaseCommit) {
			expect(canonicalCommit).toBe(expectedReleaseCommit);
		}
	});
});
