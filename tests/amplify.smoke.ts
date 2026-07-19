import { expect, test } from "@playwright/test";
import { selectFilter } from "@/tests/visual-helpers";

const publicProjectPath = "/projects/d23-membership-page";
const protectedSlug = "magnolia-app";
const secondProtectedSlug = "nbc-app";
const protectedProjectPassword = process.env.AMPLIFY_PROTECTED_PROJECT_PASSWORD;

const publicPaths = [
	"/",
	"/about",
	"/projects",
	"/photography",
	publicProjectPath,
];

test.describe("Amplify production behavior", () => {
	test("serves public routes, assets, and responsive layouts", async ({
		page,
		request,
	}) => {
		for (const path of publicPaths) {
			const response = await request.get(path);
			expect(response.status(), path).toBe(200);
			const body = await response.text();
			expect(body, path).not.toMatch(/\$2[aby]\$\d{2}\$/);
		}

		await page.goto("/");
		await page.locator("html[data-hydrated='true']").waitFor();
		const hasHorizontalOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth > window.innerWidth + 1,
		);
		expect(hasHorizontalOverflow).toBe(false);

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
		const unauthorized = await request.get(`/projects/${protectedSlug}`);
		expect(unauthorized.status()).toBe(200);
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
		const responsePromise = page.waitForResponse(
			(response) => response.request().method() === "POST" && response.ok(),
		);
		await selectFilter(page, "Dance", "Portraits");
		await responsePromise;
		await expect(
			page
				.locator(".masonry-grid")
				.getByRole("button", { name: /View fullscreen photo/ })
				.first(),
		).toBeVisible();
	});

	test("returns the dynamic resume redirect and a real 404", async ({
		request,
	}) => {
		const resume = await request.get("/resume", { maxRedirects: 0 });
		expect(resume.status()).toBe(308);
		const location = resume.headers().location;
		expect(location).toMatch(/^https:\/\/[^/]+\.ctfassets\.net\//);

		const missing = await request.get("/not-a-real-amplify-route");
		expect(missing.status()).toBe(404);
		expect(await missing.text()).toContain("Page Not Found");
	});

	test("sets a secure isolated cookie for a valid password", async ({
		page,
	}) => {
		test.skip(
			!protectedProjectPassword,
			"Set AMPLIFY_PROTECTED_PROJECT_PASSWORD to run valid-password checks",
		);
		if (!protectedProjectPassword) {
			return;
		}

		await page.goto(`/projects/${protectedSlug}`);
		await page.locator("html[data-hydrated='true']").waitFor();
		await page
			.getByLabel("Password", { exact: true })
			.fill(protectedProjectPassword);
		await page.getByRole("button", { name: "Submit password" }).click();
		await expect(
			page.getByRole("heading", { name: "Magnolia App" }),
		).toBeVisible();

		const cookies = await page.context().cookies();
		const authCookie = cookies.find(
			(cookie) => cookie.name === `project-auth-${protectedSlug}`,
		);
		expect(authCookie).toMatchObject({
			httpOnly: true,
			path: "/",
			sameSite: "Strict",
			secure: true,
		});

		await page.goto(`/projects/${secondProtectedSlug}`);
		await expect(
			page.getByRole("heading", { name: "Password Protected" }),
		).toBeVisible();
	});
});
