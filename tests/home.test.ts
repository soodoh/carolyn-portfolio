import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("should match screenshot", async ({ page }) => {
    // Make sure gifs don't animate and cause pixel mismatches
    page.route(/ctfassets.*gif/, async (request, response) => {
      const staticImgUrl = response.url().replace(/fm=\w+/, "fm=jpg");
      const staticResponse = await request.fetch({ url: staticImgUrl });
      return staticResponse;
    });
    await page.goto("/");
    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("header should appear after scrolling down", async ({ page }) => {
    await page.goto("/");
    const brandLogo = page.getByRole("link", { name: "Home" });
    const footer = page
      .getByRole("contentinfo")
      .filter({ hasText: "Copyright ©" });
    const header = page
      .getByRole("banner")
      .filter({ hasText: "about" })
      .filter({ hasText: "projects" })
      .filter({ hasText: "photography" });
    await expect(brandLogo).toBeHidden();
    await expect(header).toHaveScreenshot();
    // Header styles should change after scrolling down
    await footer.scrollIntoViewIfNeeded();
    await expect(brandLogo).toBeVisible();
    await expect(header).toHaveScreenshot();
  });
});
