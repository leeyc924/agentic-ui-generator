import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetsLayout } from "../index";
import { useAssetStore } from "../../../stores/asset-store";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  useAssetStore.getState().reset();
});

describe("AssetsLayout", () => {
  it("renders all 5 tabs", () => {
    render(<AssetsLayout />);

    expect(screen.getByRole("tab", { name: /tokens/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /icons/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /images/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /templates/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /sync/i })).toBeInTheDocument();
  });

  it("shows token editor on tokens tab by default", () => {
    render(<AssetsLayout />);

    expect(screen.getByTestId("design-token-editor")).toBeInTheDocument();
  });

  it("switches to icons tab when clicked", async () => {
    const user = userEvent.setup();
    render(<AssetsLayout />);

    await user.click(screen.getByRole("tab", { name: /icons/i }));

    expect(screen.getByTestId("icon-gallery")).toBeInTheDocument();
  });

  it("switches to images tab when clicked", async () => {
    const user = userEvent.setup();
    render(<AssetsLayout />);

    await user.click(screen.getByRole("tab", { name: /images/i }));

    expect(screen.getByTestId("image-gallery")).toBeInTheDocument();
  });

  it("switches to templates tab when clicked", async () => {
    const user = userEvent.setup();
    render(<AssetsLayout />);

    await user.click(screen.getByRole("tab", { name: /templates/i }));

    expect(screen.getByTestId("widget-template-list")).toBeInTheDocument();
  });

  it("shows sync agent panel on sync tab", async () => {
    const user = userEvent.setup();
    render(<AssetsLayout />);

    await user.click(screen.getByRole("tab", { name: /sync/i }));

    expect(screen.getByTestId("sync-agent-panel")).toBeInTheDocument();
  });

  it("tab switching updates aria-selected", async () => {
    const user = userEvent.setup();
    render(<AssetsLayout />);

    const tokensTab = screen.getByRole("tab", { name: /tokens/i });
    const iconsTab = screen.getByRole("tab", { name: /icons/i });

    expect(tokensTab).toHaveAttribute("aria-selected", "true");
    expect(iconsTab).toHaveAttribute("aria-selected", "false");

    await user.click(iconsTab);

    expect(tokensTab).toHaveAttribute("aria-selected", "false");
    expect(iconsTab).toHaveAttribute("aria-selected", "true");
  });
});

describe("DesignTokenEditor", () => {
  it("shows empty state when no tokens", () => {
    render(<AssetsLayout />);

    expect(screen.getByText("토큰 세트가 없습니다")).toBeInTheDocument();
  });

  it("shows new token set button", () => {
    render(<AssetsLayout />);

    expect(
      screen.getByRole("button", { name: /새 토큰 세트/i }),
    ).toBeInTheDocument();
  });
});

describe("SyncAgentPanel", () => {
  it("shows info text and disabled buttons", async () => {
    const user = userEvent.setup();
    render(<AssetsLayout />);

    await user.click(screen.getByRole("tab", { name: /sync/i }));

    expect(
      screen.getByText(
        "Sync Agent는 외부 디자인 도구에서 에셋을 가져옵니다. (개발 예정)",
      ),
    ).toBeInTheDocument();

    const figmaButton = screen.getByRole("button", {
      name: /figma에서 가져오기/i,
    });
    const pencilButton = screen.getByRole("button", {
      name: /pencil에서 가져오기/i,
    });

    expect(figmaButton).toBeDisabled();
    expect(pencilButton).toBeDisabled();
  });
});
