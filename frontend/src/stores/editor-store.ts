import { create } from "zustand";
import { produce } from "immer";
import type { A2UIDocument, A2UIComponent } from "../lib/types";

interface WidgetPatch {
  readonly props?: Record<string, unknown>;
  readonly style?: Record<string, string>;
  readonly children?: string[];
}

interface NewWidget {
  readonly id: string;
  readonly type: string;
  readonly props?: Record<string, unknown>;
  readonly style?: Record<string, string>;
  readonly children?: string[];
}

interface EditorState {
  readonly document: A2UIDocument | null;
  readonly selectedWidgetId: string | null;
  readonly history: readonly A2UIDocument[];
  readonly historyIndex: number;

  readonly loadDocument: (doc: A2UIDocument) => void;
  readonly selectWidget: (id: string | null) => void;
  readonly updateWidget: (id: string, patch: WidgetPatch) => void;
  readonly addWidget: (widget: NewWidget, parentId?: string) => void;
  readonly removeWidget: (id: string) => void;
  readonly moveWidget: (id: string, newParentId: string, index: number) => void;
  readonly applyLLMDocument: (doc: A2UIDocument) => void;
  readonly undo: () => void;
  readonly redo: () => void;
  readonly reset: () => void;
}

const pushToHistory = (
  history: readonly A2UIDocument[],
  historyIndex: number,
  doc: A2UIDocument,
): { history: A2UIDocument[]; historyIndex: number } => {
  const trimmed = history.slice(0, historyIndex + 1);
  return {
    history: [...trimmed, doc],
    historyIndex: historyIndex + 1,
  };
};

export const useEditorStore = create<EditorState>()((set, get) => ({
  document: null,
  selectedWidgetId: null,
  history: [],
  historyIndex: -1,

  loadDocument: (doc) => {
    set({
      document: doc,
      history: [doc],
      historyIndex: 0,
      selectedWidgetId: null,
    });
  },

  selectWidget: (id) => {
    set({ selectedWidgetId: id });
  },

  updateWidget: (id, patch) => {
    const { document, history, historyIndex } = get();
    if (!document) return;

    const updated = produce(document, (draft) => {
      const component = (draft.components as A2UIComponent[]).find(
        (c) => c.id === id,
      );
      if (!component) return;

      const mutable = component as {
        props?: Record<string, unknown>;
        style?: Record<string, string>;
        children?: string[];
      };
      if (patch.props) {
        mutable.props = { ...mutable.props, ...patch.props };
      }
      if (patch.style) {
        mutable.style = { ...mutable.style, ...patch.style };
      }
      if (patch.children) {
        mutable.children = [...patch.children];
      }
    });

    const next = pushToHistory(history, historyIndex, updated);
    set({
      document: updated,
      history: next.history,
      historyIndex: next.historyIndex,
    });
  },

  addWidget: (widget, parentId) => {
    const { document, history, historyIndex } = get();
    if (!document) return;

    const updated = produce(document, (draft) => {
      const components = draft.components as A2UIComponent[];
      (components as unknown as NewWidget[]).push({ ...widget });

      if (parentId) {
        const parent = components.find((c) => c.id === parentId);
        if (parent) {
          const mutable = parent as { children?: string[] };
          if (!mutable.children) {
            mutable.children = [];
          }
          mutable.children.push(widget.id);
        }
      }
    });

    const next = pushToHistory(history, historyIndex, updated);
    set({
      document: updated,
      history: next.history,
      historyIndex: next.historyIndex,
    });
  },

  removeWidget: (id) => {
    const { document, history, historyIndex, selectedWidgetId } = get();
    if (!document) return;

    const updated = produce(document, (draft) => {
      const components = draft.components as A2UIComponent[];
      const index = components.findIndex((c) => c.id === id);
      if (index !== -1) {
        (components as unknown as A2UIComponent[]).splice(index, 1);
      }

      // Clean up children references
      for (const component of components) {
        const mutable = component as { children?: string[] };
        if (mutable.children) {
          const childIndex = mutable.children.indexOf(id);
          if (childIndex !== -1) {
            mutable.children.splice(childIndex, 1);
          }
        }
      }
    });

    const next = pushToHistory(history, historyIndex, updated);
    set({
      document: updated,
      history: next.history,
      historyIndex: next.historyIndex,
      selectedWidgetId: selectedWidgetId === id ? null : selectedWidgetId,
    });
  },

  moveWidget: (id, newParentId, index) => {
    const { document, history, historyIndex } = get();
    if (!document) return;

    const updated = produce(document, (draft) => {
      const components = draft.components as A2UIComponent[];

      // Remove from all parents
      for (const component of components) {
        const mutable = component as { children?: string[] };
        if (mutable.children) {
          const childIndex = mutable.children.indexOf(id);
          if (childIndex !== -1) {
            mutable.children.splice(childIndex, 1);
          }
        }
      }

      // Add to new parent
      const newParent = components.find((c) => c.id === newParentId);
      if (newParent) {
        const mutable = newParent as { children?: string[] };
        if (!mutable.children) {
          mutable.children = [];
        }
        mutable.children.splice(index, 0, id);
      }
    });

    const next = pushToHistory(history, historyIndex, updated);
    set({
      document: updated,
      history: next.history,
      historyIndex: next.historyIndex,
    });
  },

  applyLLMDocument: (doc) => {
    const { history, historyIndex } = get();
    const next = pushToHistory(history, historyIndex, doc);
    set({
      document: doc,
      history: next.history,
      historyIndex: next.historyIndex,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    set({
      document: history[newIndex],
      historyIndex: newIndex,
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    set({
      document: history[newIndex],
      historyIndex: newIndex,
    });
  },

  reset: () => {
    set({
      document: null,
      selectedWidgetId: null,
      history: [],
      historyIndex: -1,
    });
  },
}));
