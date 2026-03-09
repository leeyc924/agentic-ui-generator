import { useEffect, useRef } from "react";
import { useChatStore } from "../../stores/chat-store";
import type { LLMLog } from "../../stores/chat-store";

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

const LOG_STYLE_MAP: Record<
  LLMLog["type"],
  string
> = {
  request: "border-l-2 border-l-blue-400 pl-2",
  chunk: "text-text-muted pl-2",
  done: "text-accent pl-2",
  error: "text-error pl-2",
};

interface LogEntryProps {
  readonly log: LLMLog;
}

function LogEntry({ log }: LogEntryProps) {
  const style = LOG_STYLE_MAP[log.type];
  const duration =
    log.type === "done" && log.durationMs != null ? ` (${log.durationMs}ms)` : "";

  return (
    <div data-testid={`log-entry-${log.id}`} className={`py-0.5 ${style}`}>
      <span className="text-text-muted">[{formatTimestamp(log.timestamp)}]</span>{" "}
      <span className="font-semibold">[{log.type}]</span>{" "}
      <span>
        {log.data}
        {duration}
      </span>
    </div>
  );
}

export function LogPanel() {
  const logs = useChatStore((s) => s.logs);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto font-mono text-sm p-3"
    >
      {logs.length === 0 ? (
        <p className="text-text-muted">LLM 로그가 여기에 표시됩니다</p>
      ) : (
        logs.map((log) => <LogEntry key={log.id} log={log} />)
      )}
    </div>
  );
}
