import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatStore } from "../../stores/chat-store";
import { useEditorStore } from "../../stores/editor-store";

vi.mock("../../lib/api", () => ({
  api: {
    generate: vi.fn(),
  },
}));

import { api } from "../../lib/api";
import { useSSEGenerate } from "../use-sse-generate";

function createSSEStream(events: Array<{ data: Record<string, unknown> }>) {
  const encoder = new TextEncoder();
  const lines = events.map((e) => `data:${JSON.stringify(e.data)}\n`).join("\n");

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(lines));
      controller.close();
    },
  });
}

function createMockResponse(
  stream: ReadableStream,
): Response {
  return {
    ok: true,
    body: stream,
  } as unknown as Response;
}

describe("useSSEGenerate", () => {
  beforeEach(() => {
    useChatStore.getState().reset();
    useEditorStore.getState().reset();
    vi.clearAllMocks();
  });

  it("adds user message and starts streaming", async () => {
    const stream = createSSEStream([
      { data: { text: "hello" } },
    ]);
    vi.mocked(api.generate).mockResolvedValue(createMockResponse(stream));

    const { result } = renderHook(() => useSSEGenerate());

    await act(async () => {
      await result.current.generate("my prompt");
    });

    const { messages } = useChatStore.getState();
    expect(messages[0].role).toBe("user");
    expect(messages[0].content).toBe("my prompt");
    expect(messages[1].role).toBe("assistant");
  });

  it("processes SSE chunks and appends to assistant", async () => {
    const stream = createSSEStream([
      { data: { text: "Hello" } },
      { data: { text: " world" } },
    ]);
    vi.mocked(api.generate).mockResolvedValue(createMockResponse(stream));

    const { result } = renderHook(() => useSSEGenerate());

    await act(async () => {
      await result.current.generate("prompt");
    });

    const { messages } = useChatStore.getState();
    const assistant = messages.find((m) => m.role === "assistant");
    expect(assistant?.content).toBe("Hello world");
  });

  it("adds chunk logs for each SSE event", async () => {
    const stream = createSSEStream([
      { data: { text: "chunk1" } },
      { data: { text: "chunk2" } },
    ]);
    vi.mocked(api.generate).mockResolvedValue(createMockResponse(stream));

    const { result } = renderHook(() => useSSEGenerate());

    await act(async () => {
      await result.current.generate("prompt");
    });

    const { logs } = useChatStore.getState();
    const requestLog = logs.find((l) => l.type === "request");
    const chunkLogs = logs.filter((l) => l.type === "chunk");

    expect(requestLog).toBeDefined();
    expect(requestLog?.data).toBe("prompt");
    expect(chunkLogs).toHaveLength(2);
  });

  it("handles errors gracefully", async () => {
    vi.mocked(api.generate).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSSEGenerate());

    await act(async () => {
      await result.current.generate("prompt");
    });

    const { logs, isStreaming } = useChatStore.getState();
    const errorLog = logs.find((l) => l.type === "error");

    expect(errorLog).toBeDefined();
    expect(errorLog?.data).toContain("Network error");
    expect(isStreaming).toBe(false);
  });

  it("sets isStreaming to false when done", async () => {
    const stream = createSSEStream([
      { data: { text: "done" } },
    ]);
    vi.mocked(api.generate).mockResolvedValue(createMockResponse(stream));

    const { result } = renderHook(() => useSSEGenerate());

    await act(async () => {
      await result.current.generate("prompt");
    });

    expect(useChatStore.getState().isStreaming).toBe(false);
  });

  it("calls applyLLMDocument when full_text contains valid JSON", async () => {
    const doc = {
      version: "0.1.0",
      components: [{ id: "t-1", type: "text" }],
    };
    const stream = createSSEStream([
      { data: { text: "response" } },
      { data: { full_text: JSON.stringify(doc) } },
    ]);
    vi.mocked(api.generate).mockResolvedValue(createMockResponse(stream));

    useEditorStore.getState().loadDocument({
      version: "0.1.0",
      components: [],
    });

    const { result } = renderHook(() => useSSEGenerate());

    await act(async () => {
      await result.current.generate("prompt");
    });

    const { document } = useEditorStore.getState();
    expect(document).toEqual(doc);
  });

  it("handles missing response body", async () => {
    const response = { ok: true, body: null } as unknown as Response;
    vi.mocked(api.generate).mockResolvedValue(response);

    const { result } = renderHook(() => useSSEGenerate());

    await act(async () => {
      await result.current.generate("prompt");
    });

    const { logs } = useChatStore.getState();
    const errorLog = logs.find((l) => l.type === "error");
    expect(errorLog).toBeDefined();
    expect(errorLog?.data).toContain("No response body");
  });
});
