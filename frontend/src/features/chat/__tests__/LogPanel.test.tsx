import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LogPanel } from "../LogPanel";
import { useChatStore } from "../../../stores/chat-store";

afterEach(() => {
  cleanup();
  useChatStore.getState().clearLogs();
});

const addLog = (
  type: "request" | "chunk" | "done" | "error",
  data: string,
  extra?: { tokenCount?: number; durationMs?: number },
) => {
  useChatStore.getState().addLog({ type, data, ...extra });
};

describe("LogPanel", () => {
  it("shows empty state placeholder when no logs exist", () => {
    render(<LogPanel />);

    expect(
      screen.getByText("LLM 로그가 여기에 표시됩니다"),
    ).toBeInTheDocument();
  });

  it("renders request log entries with blue left border", () => {
    addLog("request", "Generate a button component");

    render(<LogPanel />);

    const entries = screen.getAllByTestId(/^log-entry-/);
    expect(entries).toHaveLength(1);

    const entry = entries[0];
    expect(entry).toHaveTextContent("request");
    expect(entry).toHaveTextContent("Generate a button component");
    expect(entry.className).toContain("border-l-blue-400");
  });

  it("renders chunk log entries with muted text", () => {
    addLog("chunk", "partial response data");

    render(<LogPanel />);

    const entries = screen.getAllByTestId(/^log-entry-/);
    expect(entries).toHaveLength(1);

    const entry = entries[0];
    expect(entry).toHaveTextContent("chunk");
    expect(entry).toHaveTextContent("partial response data");
    expect(entry.className).toContain("text-text-muted");
  });

  it("renders done log entries with duration info", () => {
    addLog("done", "Response complete", { durationMs: 1234 });

    render(<LogPanel />);

    const entries = screen.getAllByTestId(/^log-entry-/);
    expect(entries).toHaveLength(1);

    const entry = entries[0];
    expect(entry).toHaveTextContent("done");
    expect(entry).toHaveTextContent("Response complete");
    expect(entry).toHaveTextContent("1234ms");
    expect(entry.className).toContain("text-accent");
  });

  it("renders error log entries with red styling", () => {
    addLog("error", "API rate limit exceeded");

    render(<LogPanel />);

    const entries = screen.getAllByTestId(/^log-entry-/);
    expect(entries).toHaveLength(1);

    const entry = entries[0];
    expect(entry).toHaveTextContent("error");
    expect(entry).toHaveTextContent("API rate limit exceeded");
    expect(entry.className).toContain("text-error");
  });

  it("shows timestamp for each entry in HH:MM:SS format", () => {
    addLog("request", "test prompt");

    render(<LogPanel />);

    const entry = screen.getAllByTestId(/^log-entry-/)[0];
    // Timestamp should match HH:MM:SS pattern
    expect(entry.textContent).toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
  });

  it("renders multiple log entries in order", () => {
    addLog("request", "First request");
    addLog("chunk", "Chunk data");
    addLog("done", "Complete", { durationMs: 500 });
    addLog("error", "Something failed");

    render(<LogPanel />);

    const entries = screen.getAllByTestId(/^log-entry-/);
    expect(entries).toHaveLength(4);

    expect(entries[0]).toHaveTextContent("First request");
    expect(entries[1]).toHaveTextContent("Chunk data");
    expect(entries[2]).toHaveTextContent("Complete");
    expect(entries[3]).toHaveTextContent("Something failed");
  });

  it("hides empty state when logs are present", () => {
    addLog("request", "Hello");

    render(<LogPanel />);

    expect(
      screen.queryByText("LLM 로그가 여기에 표시됩니다"),
    ).not.toBeInTheDocument();
  });
});
