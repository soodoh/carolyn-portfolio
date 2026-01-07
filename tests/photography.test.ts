import { expect, test } from "@playwright/test";

test.describe("Photography page", () => {
  test("should match screenshot", async ({ page }) => {
    await page.goto("/photography");
    await expect(page).toHaveScreenshot({
      maxDiffPixelRatio: 0.01,
    });
  });

  test("should have tab buttons that filter photos", async ({ page }) => {
    await page.goto("/photography");
    const tabButtons = page.getByRole("tab");
    const thumbnails = page.getByRole("tabpanel").getByRole("button");
    await expect(page.getByRole("tablist")).toBeVisible();
    const count = await tabButtons.count();
    for (let i = 0; i < count; i++) {
      await tabButtons.nth(i).click();
      const currentCount = await thumbnails.count();
      expect(currentCount).toBeGreaterThan(0);
    }
  });

  test("should open modal, go to next & previous photo, and then close", async ({
    page,
  }) => {
    await page.goto("/photography");
    const photos = page.getByRole("tabpanel").getByRole("img");
    const prevButton = page.getByRole("button", { name: "previous photo" });
    const nextButton = page.getByRole("button", { name: "next photo" });
    const closeButton = page.getByRole("button", { name: "close image modal" });
    console.log(await photos.count());
    await photos.first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(prevButton).toBeHidden();
    await nextButton.click();
    await expect(prevButton).toBeVisible();
    await closeButton.click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await photos.last().click();
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeHidden();
  });
});
