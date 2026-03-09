import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "../editor-store";

const SAMPLE_DOC = {
  version: "0.1.0" as const,
  components: [
    { id: "btn-1", type: "button" as const, props: { label: "Click" } },
    { id: "card-1", type: "card" as const, children: ["btn-1"] },
  ],
};

describe("EditorStore", () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it("loads a document", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    expect(useEditorStore.getState().document).toEqual(SAMPLE_DOC);
  });

  it("selects a widget", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().selectWidget("btn-1");
    expect(useEditorStore.getState().selectedWidgetId).toBe("btn-1");
  });

  it("deselects widget with null", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().selectWidget("btn-1");
    useEditorStore.getState().selectWidget(null);
    expect(useEditorStore.getState().selectedWidgetId).toBeNull();
  });

  it("updates a widget immutably", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    const before = useEditorStore.getState().document;
    useEditorStore.getState().updateWidget("btn-1", { props: { label: "New" } });
    const after = useEditorStore.getState().document;
    expect(before).not.toBe(after);
    expect(after?.components.find((c) => c.id === "btn-1")?.props?.label).toBe("New");
  });

  it("adds a widget", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().addWidget(
      { id: "txt-1", type: "text", props: { content: "Hello" } },
      "card-1",
    );
    const doc = useEditorStore.getState().document!;
    expect(doc.components.find((c) => c.id === "txt-1")).toBeTruthy();
    expect(doc.components.find((c) => c.id === "card-1")?.children).toContain("txt-1");
  });

  it("removes a widget and cleans up references", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().removeWidget("btn-1");
    const doc = useEditorStore.getState().document!;
    expect(doc.components.find((c) => c.id === "btn-1")).toBeUndefined();
    expect(doc.components.find((c) => c.id === "card-1")?.children).not.toContain("btn-1");
  });

  it("clears selection when removing selected widget", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().selectWidget("btn-1");
    useEditorStore.getState().removeWidget("btn-1");
    expect(useEditorStore.getState().selectedWidgetId).toBeNull();
  });

  it("moves a widget to new parent", () => {
    const doc = {
      version: "0.1.0",
      components: [
        { id: "btn-1", type: "button" as const },
        { id: "card-1", type: "card" as const, children: ["btn-1"] },
        { id: "card-2", type: "card" as const, children: [] as string[] },
      ],
    };
    useEditorStore.getState().loadDocument(doc);
    useEditorStore.getState().moveWidget("btn-1", "card-2", 0);
    const updated = useEditorStore.getState().document!;
    expect(updated.components.find((c) => c.id === "card-1")?.children).not.toContain("btn-1");
    expect(updated.components.find((c) => c.id === "card-2")?.children).toContain("btn-1");
  });

  it("supports undo", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().updateWidget("btn-1", { props: { label: "Changed" } });
    useEditorStore.getState().undo();
    expect(
      useEditorStore.getState().document?.components.find((c) => c.id === "btn-1")?.props?.label,
    ).toBe("Click");
  });

  it("supports redo", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().updateWidget("btn-1", { props: { label: "Changed" } });
    useEditorStore.getState().undo();
    useEditorStore.getState().redo();
    expect(
      useEditorStore.getState().document?.components.find((c) => c.id === "btn-1")?.props?.label,
    ).toBe("Changed");
  });

  it("undo does nothing at start of history", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().document).toEqual(SAMPLE_DOC);
  });

  it("redo does nothing at end of history", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().redo();
    expect(useEditorStore.getState().document).toEqual(SAMPLE_DOC);
  });

  it("new edit after undo discards future history", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().updateWidget("btn-1", { props: { label: "A" } });
    useEditorStore.getState().updateWidget("btn-1", { props: { label: "B" } });
    useEditorStore.getState().undo();
    useEditorStore.getState().updateWidget("btn-1", { props: { label: "C" } });
    useEditorStore.getState().redo();
    // redo should do nothing since future was discarded
    expect(
      useEditorStore.getState().document?.components.find((c) => c.id === "btn-1")?.props?.label,
    ).toBe("C");
  });

  it("applies LLM document", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    const newDoc = { version: "0.1.0", components: [{ id: "new-1", type: "text" as const }] };
    useEditorStore.getState().applyLLMDocument(newDoc);
    expect(useEditorStore.getState().document).toEqual(newDoc);
    // Should be undoable
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().document).toEqual(SAMPLE_DOC);
  });

  it("reset clears everything", () => {
    useEditorStore.getState().loadDocument(SAMPLE_DOC);
    useEditorStore.getState().selectWidget("btn-1");
    useEditorStore.getState().reset();
    expect(useEditorStore.getState().document).toBeNull();
    expect(useEditorStore.getState().selectedWidgetId).toBeNull();
    expect(useEditorStore.getState().history).toEqual([]);
  });
});
