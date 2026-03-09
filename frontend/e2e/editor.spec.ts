import { test, expect } from "@playwright/test";

test.describe("Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders editor layout with all panels", async ({ page }) => {
    // TopBar
    await expect(page.getByText("AGUI")).toBeVisible();

    // Left panel - Widget Tree
    await expect(page.getByText("Widget Tree")).toBeVisible();

    // Right panel - Properties
    await expect(page.getByText("Properties")).toBeVisible();

    // Bottom panel tabs
    await expect(page.getByRole("tab", { name: "Chat" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "LLM Log" })).toBeVisible();
  });

  test("shows empty canvas state", async ({ page }) => {
    await expect(
      page.getByText("자연어로 UI를 생성하거나 프로젝트를 불러오세요"),
    ).toBeVisible();
  });

  test("shows widget selection placeholder in properties panel", async ({
    page,
  }) => {
    await expect(page.getByText("위젯을 선택하세요")).toBeVisible();
  });

  test("shows empty widget tree message", async ({ page }) => {
    await expect(page.getByText("위젯이 없습니다")).toBeVisible();
  });

  test("switches between Chat and LLM Log tabs", async ({ page }) => {
    // Click LLM Log tab
    await page.getByRole("tab", { name: "LLM Log" }).click();
    await expect(
      page.getByText("LLM 로그가 여기에 표시됩니다"),
    ).toBeVisible();

    // Click Chat tab back
    await page.getByRole("tab", { name: "Chat" }).click();
    await expect(page.getByTestId("chat-input")).toBeVisible();
  });

  test("chat input has correct placeholder", async ({ page }) => {
    const textarea = page
      .getByTestId("chat-input")
      .locator("textarea");
    await expect(textarea).toHaveAttribute(
      "placeholder",
      "자연어로 UI를 생성하세요...",
    );
  });

  test("undo and redo buttons exist and are visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /undo/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /redo/i })).toBeVisible();
  });

  test("save button is disabled", async ({ page }) => {
    await expect(page.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  test("all main panels have correct test ids", async ({ page }) => {
    await expect(page.getByTestId("top-bar")).toBeVisible();
    await expect(page.getByTestId("left-panel")).toBeVisible();
    await expect(page.getByTestId("canvas")).toBeVisible();
    await expect(page.getByTestId("right-panel")).toBeVisible();
    await expect(page.getByTestId("bottom-panel")).toBeVisible();
  });
});
