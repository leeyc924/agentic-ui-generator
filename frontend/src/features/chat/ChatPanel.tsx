import { useCallback } from "react";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useSSEGenerate } from "../../hooks/use-sse-generate";

export function ChatPanel() {
  const { generate } = useSSEGenerate();

  const handleSend = useCallback(
    (message: string) => {
      generate(message);
    },
    [generate],
  );

  return (
    <div className="flex flex-col h-full">
      <MessageList />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
