import { useState, useCallback, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { useChatStore } from "../../stores/chat-store";
import { useEditorStore } from "../../stores/editor-store";

interface ChatInputProps {
  readonly onSend: (message: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const isStreaming = useChatStore((s) => s.isStreaming);
  const selectedWidgetId = useEditorStore((s) => s.selectedWidgetId);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || isStreaming) return;
    onSend(trimmed);
    setValue("");
  }, [value, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const placeholder = selectedWidgetId
    ? "선택된 위젯을 수정하세요..."
    : "자연어로 UI를 생성하세요...";

  return (
    <div data-testid="chat-input" className="border-t border-border p-3">
      {selectedWidgetId && (
        <div className="mb-2">
          <span className="inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent">
            {selectedWidgetId} 선택됨
          </span>
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isStreaming}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          style={{ maxHeight: "6rem" }}
        />
        <button
          onClick={handleSend}
          disabled={isStreaming || value.trim().length === 0}
          aria-label="Send"
          className="rounded-lg bg-accent p-2 text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
