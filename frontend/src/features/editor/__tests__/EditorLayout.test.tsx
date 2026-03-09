import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditorLayout } from "../index";

afterEach(() => {
  cleanup();
});

describe("EditorLayout", () => {
  it("renders all 5 sections", () => {
    render(<EditorLayout />);

    expect(screen.getByTestId("top-bar")).toBeInTheDocument();
    expect(screen.getByTestId("left-panel")).toBeInTheDocument();
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
    expect(screen.getByTestId("right-panel")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-panel")).toBeInTheDocument();
  });
});

describe("TopBar", () => {
  it("renders AGUI title and undo/redo buttons", () => {
    render(<EditorLayout />);

    const topBar = screen.getByTestId("top-bar");
    expect(topBar).toHaveTextContent("AGUI");
    expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /redo/i })).toBeInTheDocument();
  });

  it("renders save button", () => {
    render(<EditorLayout />);

    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });
});

describe("LeftPanel", () => {
  it("shows Widget Tree header", () => {
    render(<EditorLayout />);

    const leftPanel = screen.getByTestId("left-panel");
    expect(leftPanel).toHaveTextContent("Widget Tree");
  });

  it("shows placeholder text", () => {
    render(<EditorLayout />);

    const leftPanel = screen.getByTestId("left-panel");
    expect(leftPanel).toHaveTextContent("위젯 트리가 여기에 표시됩니다");
  });
});

describe("RightPanel", () => {
  it("shows Properties header", () => {
    render(<EditorLayout />);

    const rightPanel = screen.getByTestId("right-panel");
    expect(rightPanel).toHaveTextContent("Properties");
  });

  it("shows placeholder text", () => {
    render(<EditorLayout />);

    const rightPanel = screen.getByTestId("right-panel");
    expect(rightPanel).toHaveTextContent("위젯을 선택하세요");
  });
});

describe("Canvas", () => {
  it("shows empty state when no document loaded", () => {
    render(<EditorLayout />);

    const canvas = screen.getByTestId("canvas");
    expect(canvas).toHaveTextContent(
      "자연어로 UI를 생성하거나 프로젝트를 불러오세요",
    );
  });
});

describe("BottomPanel", () => {
  it("has Chat and LLM Log tabs", () => {
    render(<EditorLayout />);

    expect(screen.getByRole("tab", { name: /chat/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /llm log/i })).toBeInTheDocument();
  });

  it("switches tabs when clicked", async () => {
    const user = userEvent.setup();
    render(<EditorLayout />);

    const chatTab = screen.getByRole("tab", { name: /chat/i });
    const llmLogTab = screen.getByRole("tab", { name: /llm log/i });

    // Chat tab is active by default
    expect(chatTab).toHaveAttribute("aria-selected", "true");
    expect(llmLogTab).toHaveAttribute("aria-selected", "false");

    // Click LLM Log tab
    await user.click(llmLogTab);

    expect(chatTab).toHaveAttribute("aria-selected", "false");
    expect(llmLogTab).toHaveAttribute("aria-selected", "true");

    // Verify LLM Log content is shown
    const bottomPanel = screen.getByTestId("bottom-panel");
    expect(bottomPanel).toHaveTextContent("LLM 로그가 여기에 표시됩니다");
  });

  it("shows chat content by default", () => {
    render(<EditorLayout />);

    const bottomPanel = screen.getByTestId("bottom-panel");
    expect(bottomPanel).toHaveTextContent("채팅 메시지가 여기에 표시됩니다");
  });
});
