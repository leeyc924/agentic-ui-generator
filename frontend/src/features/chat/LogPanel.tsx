import { useEffect, useRef, useState } from "react";

interface BackendLog {
  readonly id: string;
  readonly timestamp: number;
  readonly level: string;
  readonly logger: string;
  readonly message: string;
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts * 1000);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

const LEVEL_STYLE: Record<string, string> = {
  ERROR: "text-error",
  WARNING: "text-yellow-400",
  INFO: "text-accent",
  DEBUG: "text-text-muted",
};

function LogEntry({ log }: { readonly log: BackendLog }) {
  const levelStyle = LEVEL_STYLE[log.level] ?? "text-text-secondary";

  return (
    <div className="py-0.5 flex gap-1.5">
      <span className="text-text-muted shrink-0">
        [{formatTimestamp(log.timestamp)}]
      </span>
      <span className={`font-semibold shrink-0 w-14 ${levelStyle}`}>
        {log.level}
      </span>
      <span className="text-text-secondary truncate">{log.message}</span>
    </div>
  );
}

let logIdCounter = 0;

export function LogPanel() {
  const [logs, setLogs] = useState<BackendLog[]>([]);
  const [connected, setConnected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource("/api/logs/stream");

    es.addEventListener("log", (event) => {
      const data = JSON.parse(event.data);
      logIdCounter += 1;
      const log: BackendLog = {
        id: `bl-${logIdCounter}`,
        timestamp: data.timestamp,
        level: data.level,
        logger: data.logger,
        message: data.message,
      };
      setLogs((prev) => {
        const next = [...prev, log];
        return next.length > 500 ? next.slice(-300) : next;
      });
    });

    es.addEventListener("ping", () => {});

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    return () => es.close();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto font-mono text-xs p-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
        />
        <span className="text-text-muted text-[10px]">
          {connected ? "Backend 연결됨" : "연결 끊김"}
        </span>
        {logs.length > 0 && (
          <button
            onClick={() => setLogs([])}
            className="ml-auto text-[10px] text-text-muted hover:text-text-primary"
          >
            지우기
          </button>
        )}
      </div>
      {logs.length === 0 ? (
        <p className="text-text-muted">백엔드 로그가 여기에 표시됩니다</p>
      ) : (
        logs.map((log) => <LogEntry key={log.id} log={log} />)
      )}
    </div>
  );
}
