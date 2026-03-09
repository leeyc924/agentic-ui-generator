import { describe, it, expect, beforeEach } from "vitest";
import { useChatStore } from "../chat-store";

describe("ChatStore", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it("addUserMessage creates message with role user", () => {
    const id = useChatStore.getState().addUserMessage("Hello");
    const { messages } = useChatStore.getState();

    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe(id);
    expect(messages[0].role).toBe("user");
    expect(messages[0].content).toBe("Hello");
    expect(messages[0].timestamp).toBeGreaterThan(0);
  });

  it("addAssistantMessage creates message with role assistant", () => {
    const id = useChatStore.getState().addAssistantMessage("Hi there");
    const { messages } = useChatStore.getState();

    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe(id);
    expect(messages[0].role).toBe("assistant");
    expect(messages[0].content).toBe("Hi there");
    expect(messages[0].timestamp).toBeGreaterThan(0);
  });

  it("appendToLastAssistant appends text to last assistant message", () => {
    useChatStore.getState().addUserMessage("prompt");
    useChatStore.getState().addAssistantMessage("Hello");
    useChatStore.getState().appendToLastAssistant(" world");

    const { messages } = useChatStore.getState();
    const assistant = messages.find((m) => m.role === "assistant");
    expect(assistant?.content).toBe("Hello world");
  });

  it("appendToLastAssistant does nothing if no assistant message", () => {
    useChatStore.getState().addUserMessage("only user");
    useChatStore.getState().appendToLastAssistant("chunk");

    const { messages } = useChatStore.getState();
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe("only user");
  });

  it("appendToLastAssistant creates new messages array (immutable)", () => {
    useChatStore.getState().addAssistantMessage("start");
    const before = useChatStore.getState().messages;
    useChatStore.getState().appendToLastAssistant(" end");
    const after = useChatStore.getState().messages;

    expect(before).not.toBe(after);
  });

  it("addLog adds to logs array", () => {
    useChatStore.getState().addLog({ type: "request", data: "test prompt" });

    const { logs } = useChatStore.getState();
    expect(logs).toHaveLength(1);
    expect(logs[0].type).toBe("request");
    expect(logs[0].data).toBe("test prompt");
    expect(logs[0].id).toBeDefined();
    expect(logs[0].timestamp).toBeGreaterThan(0);
  });

  it("addLog preserves optional fields", () => {
    useChatStore.getState().addLog({
      type: "done",
      data: "completed",
      tokenCount: 150,
      durationMs: 3000,
    });

    const { logs } = useChatStore.getState();
    expect(logs[0].tokenCount).toBe(150);
    expect(logs[0].durationMs).toBe(3000);
  });

  it("setStreaming toggles isStreaming", () => {
    expect(useChatStore.getState().isStreaming).toBe(false);

    useChatStore.getState().setStreaming(true);
    expect(useChatStore.getState().isStreaming).toBe(true);

    useChatStore.getState().setStreaming(false);
    expect(useChatStore.getState().isStreaming).toBe(false);
  });

  it("clearMessages clears messages but keeps logs", () => {
    useChatStore.getState().addUserMessage("msg");
    useChatStore.getState().addLog({ type: "request", data: "log" });
    useChatStore.getState().clearMessages();

    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(0);
    expect(state.logs).toHaveLength(1);
  });

  it("clearLogs clears logs but keeps messages", () => {
    useChatStore.getState().addUserMessage("msg");
    useChatStore.getState().addLog({ type: "request", data: "log" });
    useChatStore.getState().clearLogs();

    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(1);
    expect(state.logs).toHaveLength(0);
  });

  it("reset clears everything", () => {
    useChatStore.getState().addUserMessage("msg");
    useChatStore.getState().addAssistantMessage("reply");
    useChatStore.getState().addLog({ type: "request", data: "log" });
    useChatStore.getState().setStreaming(true);
    useChatStore.getState().reset();

    const state = useChatStore.getState();
    expect(state.messages).toHaveLength(0);
    expect(state.logs).toHaveLength(0);
    expect(state.isStreaming).toBe(false);
  });
});
