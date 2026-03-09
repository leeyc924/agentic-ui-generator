import { test, expect } from "@playwright/test";

test.describe("Assets Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/assets");
  });

  test("navigates to assets page and shows title", async ({ page }) => {
    await expect(page.getByText("자산 관리")).toBeVisible();
  });

  test("shows assets page description", async ({ page }) => {
    await expect(
      page.getByText("디자인 토큰, 이미지, 아이콘, 위젯 템플릿 관리"),
    ).toBeVisible();
  });
});
