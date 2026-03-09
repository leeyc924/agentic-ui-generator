import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPanel } from "../ChatPanel";
import { useChatStore } from "../../../stores/chat-store";
import { useEditorStore } from "../../../stores/editor-store";

vi.mock("../../../hooks/use-sse-generate", () => ({
  useSSEGenerate: () => ({
    generate: mockGenerate,
  }),
}));

const mockGenerate = vi.fn();

beforeEach(() => {
  useChatStore.getState().reset();
  useEditorStore.getState().reset();
  mockGenerate.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("ChatPanel", () => {
  it("renders MessageList and ChatInput", () => {
    render(<ChatPanel />);

    expect(screen.getByTestId("message-list")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
  });
});

describe("MessageList", () => {
  it("shows user and assistant messages", () => {
    const { addUserMessage, addAssistantMessage } = useChatStore.getState();
    addUserMessage("Hello");
    addAssistantMessage("Hi there");

    render(<ChatPanel />);

    const messages = useChatStore.getState().messages;
    const userMsg = screen.getByTestId(`message-${messages[0].id}`);
    const assistantMsg = screen.getByTestId(`message-${messages[1].id}`);

    expect(userMsg).toHaveTextContent("Hello");
    expect(assistantMsg).toHaveTextContent("Hi there");
  });

  it("shows streaming indicator during generation", () => {
    useChatStore.getState().setStreaming(true);

    render(<ChatPanel />);

    expect(screen.getByText("생성 중...")).toBeInTheDocument();
  });

  it("does not show streaming indicator when not streaming", () => {
    render(<ChatPanel />);

    expect(screen.queryByText("생성 중...")).not.toBeInTheDocument();
  });
});

describe("ChatInput", () => {
  it("sends message on Enter", async () => {
    const user = userEvent.setup();
    render(<ChatPanel />);

    const textarea = screen.getByPlaceholderText(
      "자연어로 UI를 생성하세요...",
    );
    await user.type(textarea, "Create a button");
    await user.keyboard("{Enter}");

    expect(mockGenerate).toHaveBeenCalledWith("Create a button");
  });

  it("Shift+Enter adds newline instead of sending", async () => {
    const user = userEvent.setup();
    render(<ChatPanel />);

    const textarea = screen.getByPlaceholderText(
      "자연어로 UI를 생성하세요...",
    );
    await user.type(textarea, "line1");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(textarea, "line2");

    expect(mockGenerate).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("line1\nline2");
  });

  it("is disabled during streaming", () => {
    useChatStore.getState().setStreaming(true);

    render(<ChatPanel />);

    const textarea = screen.getByPlaceholderText(
      "자연어로 UI를 생성하세요...",
    );
    const sendButton = screen.getByRole("button", { name: /send/i });

    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it("shows selected widget badge when widget is selected", () => {
    useEditorStore.getState().selectWidget("btn-1");

    render(<ChatPanel />);

    expect(screen.getByText("btn-1 선택됨")).toBeInTheDocument();
  });

  it("shows correct placeholder when widget is selected", () => {
    useEditorStore.getState().selectWidget("btn-1");

    render(<ChatPanel />);

    expect(
      screen.getByPlaceholderText("선택된 위젯을 수정하세요..."),
    ).toBeInTheDocument();
  });

  it("shows default placeholder when no widget is selected", () => {
    render(<ChatPanel />);

    expect(
      screen.getByPlaceholderText("자연어로 UI를 생성하세요..."),
    ).toBeInTheDocument();
  });

  it("clears input after sending", async () => {
    const user = userEvent.setup();
    render(<ChatPanel />);

    const textarea = screen.getByPlaceholderText(
      "자연어로 UI를 생성하세요...",
    );
    await user.type(textarea, "Create a button");
    await user.keyboard("{Enter}");

    expect(textarea).toHaveValue("");
  });

  it("does not send empty messages", async () => {
    const user = userEvent.setup();
    render(<ChatPanel />);

    const textarea = screen.getByPlaceholderText(
      "자연어로 UI를 생성하세요...",
    );
    await user.click(textarea);
    await user.keyboard("{Enter}");

    expect(mockGenerate).not.toHaveBeenCalled();
  });
});
