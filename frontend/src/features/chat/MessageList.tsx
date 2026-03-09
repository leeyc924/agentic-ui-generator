import { useEffect, useRef } from "react";
import { useChatStore } from "../../stores/chat-store";

export function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <div
      data-testid="message-list"
      className="flex-1 overflow-auto p-3 space-y-2"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          data-testid={`message-${msg.id}`}
          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
            msg.role === "user"
              ? "ml-auto bg-accent/20 text-text-primary"
              : "mr-auto bg-surface-elevated text-text-primary"
          }`}
        >
          {msg.content}
        </div>
      ))}
      {isStreaming && (
        <div className="text-sm text-text-muted animate-pulse">생성 중...</div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
