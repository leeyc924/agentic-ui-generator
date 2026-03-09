import { create } from "zustand";

export interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly timestamp: number;
}

export interface LLMLog {
  readonly id: string;
  readonly type: "request" | "chunk" | "done" | "error";
  readonly data: string;
  readonly timestamp: number;
  readonly tokenCount?: number;
  readonly durationMs?: number;
}

interface ChatState {
  readonly messages: readonly ChatMessage[];
  readonly logs: readonly LLMLog[];
  readonly isStreaming: boolean;

  readonly addUserMessage: (content: string) => string;
  readonly addAssistantMessage: (content: string) => string;
  readonly appendToLastAssistant: (chunk: string) => void;
  readonly addLog: (log: Omit<LLMLog, "id" | "timestamp">) => void;
  readonly setStreaming: (streaming: boolean) => void;
  readonly clearMessages: () => void;
  readonly clearLogs: () => void;
  readonly reset: () => void;
}

let nextId = 0;
const generateId = (): string => {
  nextId += 1;
  return `msg-${nextId}-${Date.now()}`;
};

const generateLogId = (): string => {
  nextId += 1;
  return `log-${nextId}-${Date.now()}`;
};

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  logs: [],
  isStreaming: false,

  addUserMessage: (content) => {
    const id = generateId();
    const message: ChatMessage = {
      id,
      role: "user",
      content,
      timestamp: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, message],
    }));
    return id;
  },

  addAssistantMessage: (content) => {
    const id = generateId();
    const message: ChatMessage = {
      id,
      role: "assistant",
      content,
      timestamp: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, message],
    }));
    return id;
  },

  appendToLastAssistant: (chunk) => {
    set((state) => {
      const lastAssistantIndex = findLastAssistantIndex(state.messages);
      if (lastAssistantIndex === -1) return state;

      const updated = state.messages.map((msg, i) =>
        i === lastAssistantIndex
          ? { ...msg, content: msg.content + chunk }
          : msg,
      );
      return { messages: updated };
    });
  },

  addLog: (logInput) => {
    const log: LLMLog = {
      ...logInput,
      id: generateLogId(),
      timestamp: Date.now(),
    };
    set((state) => ({
      logs: [...state.logs, log],
    }));
  },

  setStreaming: (streaming) => {
    set({ isStreaming: streaming });
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  reset: () => {
    set({ messages: [], logs: [], isStreaming: false });
  },
}));

function findLastAssistantIndex(
  messages: readonly ChatMessage[],
): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") return i;
  }
  return -1;
}
