import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { EditorLayout } from "../index";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

afterEach(() => {
  cleanup();
});

describe("EditorLayout", () => {
  it("renders all 5 sections", () => {
    renderWithRouter(<EditorLayout />);

    expect(screen.getByTestId("top-bar")).toBeInTheDocument();
    expect(screen.getByTestId("left-panel")).toBeInTheDocument();
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
    expect(screen.getByTestId("right-panel")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-panel")).toBeInTheDocument();
  });
});

describe("TopBar", () => {
  it("renders A2UI title and undo/redo buttons", () => {
    renderWithRouter(<EditorLayout />);

    const topBar = screen.getByTestId("top-bar");
    expect(topBar).toHaveTextContent("A2UI");
    expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /redo/i })).toBeInTheDocument();
  });

  it("renders save button", () => {
    renderWithRouter(<EditorLayout />);

    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });
});

describe("LeftPanel", () => {
  it("shows Widget Tree header", () => {
    renderWithRouter(<EditorLayout />);

    const leftPanel = screen.getByTestId("left-panel");
    expect(leftPanel).toHaveTextContent("Widget Tree");
  });

  it("shows empty state when no document loaded", () => {
    renderWithRouter(<EditorLayout />);

    const leftPanel = screen.getByTestId("left-panel");
    expect(leftPanel).toHaveTextContent("위젯이 없습니다");
  });
});

describe("RightPanel", () => {
  it("shows Properties header", () => {
    renderWithRouter(<EditorLayout />);

    const rightPanel = screen.getByTestId("right-panel");
    expect(rightPanel).toHaveTextContent("Properties");
  });

  it("shows placeholder text", () => {
    renderWithRouter(<EditorLayout />);

    const rightPanel = screen.getByTestId("right-panel");
    expect(rightPanel).toHaveTextContent("위젯을 선택하세요");
  });
});

describe("Canvas", () => {
  it("shows empty state when no document loaded", () => {
    renderWithRouter(<EditorLayout />);

    const canvas = screen.getByTestId("canvas");
    expect(canvas).toHaveTextContent(
      "자연어로 UI를 생성하거나 프로젝트를 불러오세요",
    );
  });
});

describe("BottomPanel", () => {
  it("has Chat and Log tabs", () => {
    renderWithRouter(<EditorLayout />);

    expect(screen.getByRole("tab", { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /^log$/i })).toBeInTheDocument();
  });

  it("switches tabs when clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<EditorLayout />);

    const chatTab = screen.getByRole("tab", { name: /chat/i });
    const logTab = screen.getByRole("tab", { name: /^log$/i });

    expect(chatTab).toHaveAttribute("aria-selected", "true");
    expect(logTab).toHaveAttribute("aria-selected", "false");

    await user.click(logTab);

    expect(chatTab).toHaveAttribute("aria-selected", "false");
    expect(logTab).toHaveAttribute("aria-selected", "true");
  });

  it("shows chat panel by default", () => {
    renderWithRouter(<EditorLayout />);

    const bottomPanel = screen.getByTestId("bottom-panel");
    expect(bottomPanel).toContainElement(screen.getByTestId("message-list"));
    expect(bottomPanel).toContainElement(screen.getByTestId("chat-input"));
  });
});
