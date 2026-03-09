import { useState } from "react";
import { ResizeHandle } from "./ResizeHandle";
import { ChatPanel } from "../chat";
import { LogPanel } from "../chat/LogPanel";
import { JsonPanel } from "./panels/JsonPanel";
import { CodePanel } from "./panels/CodePanel";

type Tab = "chat" | "llm-log" | "json" | "code";

interface BottomPanelProps {
  readonly height: number;
  readonly onResize: (delta: number) => void;
}

const TABS: readonly { readonly id: Tab; readonly label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "llm-log", label: "Log" },
  { id: "json", label: "JSON" },
  { id: "code", label: "Code" },
];

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
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-accent border-b-2 border-accent"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && <ChatPanel />}
          {activeTab === "llm-log" && <LogPanel />}
          {activeTab === "json" && <JsonPanel />}
          {activeTab === "code" && <CodePanel />}
        </div>
      </div>
    </div>
  );
}
