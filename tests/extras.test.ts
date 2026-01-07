import { expect, test } from "@playwright/test";

test("About page should match screenshot", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveScreenshot({
    maxDiffPixelRatio: 0.01,
  });
});
