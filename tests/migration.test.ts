import { expect, test } from "@playwright/test";
import { prepareVisualPage } from "@/tests/visual-helpers";

test.describe("TanStack Start migration behavior", () => {
	test("navigates through an internal link without a document reload", async ({
		page,
	}) => {
		await prepareVisualPage(page);
		await page.goto("/");
		await page.locator("html[data-hydrated='true']").waitFor();
		await page.evaluate(() => {
			window.name = "tanstack-spa-navigation";
		});
		await page.getByRole("link", { name: "View Projects" }).click();
		await expect(page).toHaveURL(/\/projects\/?$/);
		await expect(page.getByRole("tabpanel")).toBeVisible();
		expect(await page.evaluate(() => window.name)).toBe(
			"tanstack-spa-navigation",
		);
		await page.goBack();
		await expect(page).toHaveURL(/\/$/);
	});

	test("generates bounded responsive image URLs", async ({ page }) => {
		await page.goto("/");
		const backgroundImage = page.locator("main img").first();
		await expect(backgroundImage).toHaveAttribute("src", /[?&]w=4000(?:&|$)/);

		const srcset = await backgroundImage.getAttribute("srcset");
		expect(srcset).toContain("w=3840");
		expect(srcset).toContain("3840w");
	});

	test("rejects invalid credentials and isolates protected-project cookies", async ({
		page,
		request,
	}) => {
		const unauthorized = await request.get("/projects/magnolia-app");
		expect(unauthorized.status()).toBe(200);
		const unauthorizedHtml = await unauthorized.text();
		expect(unauthorizedHtml).not.toContain("playwright-password");
		expect(unauthorizedHtml).not.toContain("Magnolia App");
		expect(unauthorizedHtml).not.toMatch(/\$2[aby]\$\d{2}\$/);

		await page.goto("/projects/magnolia-app");
		await page.locator("html[data-hydrated='true']").waitFor();
		const passwordInput = page.getByLabel("Password", { exact: true });
		await page.getByRole("button", { name: "Submit password" }).click();
		await expect(page.getByText("Please enter a password.")).toBeVisible();

		await passwordInput.fill("é".repeat(37));
		await page.getByRole("button", { name: "Submit password" }).click();
		const passwordLengthError = page.getByRole("alert");
		await expect(passwordLengthError).toHaveText("Password is too long.");
		await expect(passwordInput).toHaveAttribute("aria-invalid", "true");
		await expect(passwordInput).toHaveAttribute(
			"aria-describedby",
			"project-password-error",
		);

		await passwordInput.fill("incorrect");
		await page.getByRole("button", { name: "Submit password" }).click();
		await expect(
			page.getByText("The password you entered is incorrect."),
		).toBeVisible();

		await page
			.getByLabel("Password", { exact: true })
			.fill("playwright-password");
		await page.getByRole("button", { name: "Submit password" }).click();
		await expect(
			page.getByRole("heading", { name: "Magnolia App" }),
		).toBeVisible();

		const cookies = await page.context().cookies();
		const authCookie = cookies.find(
			(cookie) => cookie.name === "project-auth-magnolia-app",
		);
		expect(authCookie).toMatchObject({
			httpOnly: true,
			path: "/",
			sameSite: "Strict",
		});

		await page.goto("/projects/nbc-app");
		await expect(
			page.getByRole("heading", { name: "Password Protected" }),
		).toBeVisible();

		await page.context().addCookies([
			{
				name: "project-auth-nbc-app",
				value: "tampered-token",
				url: new URL(page.url()).origin,
			},
		]);
		await page.reload();
		await expect(
			page.getByRole("heading", { name: "Password Protected" }),
		).toBeVisible();
	});

	test("returns 404 for removed auth and missing project routes", async ({
		request,
	}) => {
		const removedAuth = await request.get("/projects/magnolia-app/auth");
		expect(removedAuth.status()).toBe(404);

		const partialProtectedSlug = await request.get("/projects/magnolia");
		expect(partialProtectedSlug.status()).toBe(404);

		for (const slug of ["toString", "constructor", "__proto__", "bad_slug"]) {
			const malformedProject = await request.get(`/projects/${slug}`);
			expect(malformedProject.status()).toBe(404);
		}

		const overlongProject = await request.get(`/projects/${"a".repeat(101)}`);
		expect(overlongProject.status()).toBe(404);

		const missingProject = await request.get("/projects/not-a-real-project");
		expect(missingProject.status()).toBe(404);
	});
});
