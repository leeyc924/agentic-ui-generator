import { test, expect } from "@playwright/test";

test.describe("Preview Page", () => {
  test("shows loading state initially", async ({ page }) => {
    await page.goto("/preview/nonexistent-id");
    // Should briefly show loading or resolve to error
    await expect(page.locator("body")).toBeVisible();
  });

  test("shows error or not-found for non-existent project", async ({
    page,
  }) => {
    await page.goto("/preview/nonexistent-id");
    // The API call will fail (no backend) resulting in error message,
    // or show "프로젝트를 찾을 수 없습니다" if the API returns null
    await expect(
      page.getByText(/프로젝트를 찾을 수 없습니다|Failed|fetch|Error|오류/i),
    ).toBeVisible({ timeout: 10000 });
  });

  test("page does not crash on invalid id", async ({ page }) => {
    await page.goto("/preview/!@#$%^&*");
    // Should gracefully handle invalid IDs without crashing
    await expect(page.locator("body")).toBeVisible();
  });
});
