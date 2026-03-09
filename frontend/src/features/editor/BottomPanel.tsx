import { useState } from "react";
import { ResizeHandle } from "./ResizeHandle";
import { LogPanel } from "../chat/LogPanel";

type Tab = "chat" | "llm-log";

interface BottomPanelProps {
  readonly height: number;
  readonly onResize: (delta: number) => void;
}

export function BottomPanel({ height, onResize }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  return (
    <div data-testid="bottom-panel" className="flex flex-col flex-shrink-0">
      <ResizeHandle
        direction="vertical"
        onResize={(delta) => onResize(-delta)}
      />
      <div
        className="bg-surface border-t border-border flex flex-col overflow-hidden"
        style={{ height }}
      >
        <div
          className="flex border-b border-border"
          role="tablist"
          aria-label="Bottom panel tabs"
        >
          <button
            role="tab"
            aria-selected={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "chat"
                ? "text-accent border-b-2 border-accent"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Chat
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "llm-log"}
            onClick={() => setActiveTab("llm-log")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "llm-log"
                ? "text-accent border-b-2 border-accent"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            LLM Log
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" ? (
            <div className="p-3 overflow-auto h-full">
              <p className="text-sm text-text-muted">
                채팅 메시지가 여기에 표시됩니다
              </p>
            </div>
          ) : (
            <LogPanel />
          )}
        </div>
      </div>
    </div>
  );
}
