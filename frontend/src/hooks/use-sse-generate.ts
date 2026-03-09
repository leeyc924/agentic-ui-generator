import { useCallback } from "react";
import { useChatStore } from "../stores/chat-store";
import { useEditorStore } from "../stores/editor-store";
import { api } from "../lib/api";

export function useSSEGenerate() {
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);
  const appendToLastAssistant = useChatStore((s) => s.appendToLastAssistant);
  const addLog = useChatStore((s) => s.addLog);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const applyLLMDocument = useEditorStore((s) => s.applyLLMDocument);
  const document = useEditorStore((s) => s.document);
  const selectedWidgetId = useEditorStore((s) => s.selectedWidgetId);

  const generate = useCallback(
    async (prompt: string) => {
      addUserMessage(prompt);
      addAssistantMessage("");
      setStreaming(true);
      addLog({ type: "request", data: prompt });

      const startTime = Date.now();

      try {
        const response = await api.generate(
          prompt,
          selectedWidgetId ?? undefined,
          document ?? undefined,
        );
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No response body");

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const data = JSON.parse(line.slice(5));
              if (data.text) {
                appendToLastAssistant(data.text);
                addLog({ type: "chunk", data: data.text });
              }
              if (data.full_text) {
                addLog({
                  type: "done",
                  data: `Completed in ${Date.now() - startTime}ms`,
                  durationMs: Date.now() - startTime,
                });
                try {
                  const parsed = JSON.parse(data.full_text);
                  applyLLMDocument(parsed);
                } catch {
                  // full_text might not be valid JSON
                }
              }
            }
          }
        }
      } catch (error) {
        addLog({ type: "error", data: String(error) });
      } finally {
        setStreaming(false);
      }
    },
    [
      addUserMessage,
      addAssistantMessage,
      appendToLastAssistant,
      addLog,
      setStreaming,
      applyLLMDocument,
      document,
      selectedWidgetId,
    ],
  );

  return { generate };
}
