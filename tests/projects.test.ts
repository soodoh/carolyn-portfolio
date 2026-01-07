import { expect, test } from "@playwright/test";

test.describe("Projects page", () => {
  test("should match screenshot", async ({ page }) => {
    // Make sure gifs don't animate and cause pixel mismatches
    page.route(/ctfassets.*gif/, async (request, response) => {
      const staticImgUrl = response.url().replace(/fm=\w+/, "fm=jpg");
      const staticResponse = await request.fetch({ url: staticImgUrl });
      return staticResponse;
    });
    await page.goto("/projects");
    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("should have tab buttons that filter projects", async ({ page }) => {
    await page.goto("/projects");
    const tabButtons = page.getByRole("tab");
    const thumbnails = page.getByRole("tabpanel").getByRole("link");
    await expect(page.getByRole("tablist")).toBeVisible();
    // Clicking "All" should be equal to the initial number (already selected)
    const initialCount = await thumbnails.count();
    await tabButtons.filter({ hasText: "all" }).click();
    await expect(thumbnails).toHaveCount(initialCount);
    // Other sections should all have less than "All" projects
    const otherTabs = tabButtons.filter({ hasNotText: "all" });
    const count = await otherTabs.count();
    for (let i = 0; i < count; i++) {
      await otherTabs.nth(i).click();
      // Wait for thumbnail count to change since there is masonry animation
      // And locator.count() does not retry
      const prevCount = await thumbnails.count();
      await page.waitForFunction(
        (prevCount) =>
          document.querySelectorAll("[role=tabpanel] a").length !== prevCount,
        prevCount,
      );
      const currentCount = await thumbnails.count();
      expect(currentCount).toBeGreaterThan(0);
      expect(currentCount).toBeLessThan(initialCount);
    }
  });

  test("should open project page with no video", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("link", { name: "the voice app" }).click();
    await expect(page).toHaveURL("/projects/the-voice-app-agt-app");
    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("should open project page with video", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("link", { name: "em/body" }).click();
    await expect(page).toHaveURL("/projects/em-body");
    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("should open password protected project page", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("link", { name: "magnolia app" }).click();
    await expect(page).toHaveURL("/projects/magnolia-app");
    await expect(
      page.getByRole("heading", { name: "password protected" }),
    ).toBeVisible();
    await page.getByLabel("Password", { exact: true }).fill("cdux");
    await page.getByRole("button", { name: "submit password" }).click();
    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});
