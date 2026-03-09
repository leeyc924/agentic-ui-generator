import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { Canvas } from "../Canvas";
import { useEditorStore } from "../../../stores/editor-store";
import type { A2UIDocument } from "../../../lib/types";

afterEach(() => {
  cleanup();
  useEditorStore.getState().reset();
});

function makeDoc(): A2UIDocument {
  return {
    version: "0.1.0",
    components: [
      {
        id: "card-1",
        type: "card",
        children: ["text-1"],
      },
      { id: "text-1", type: "text", props: { content: "Hello World" } },
      { id: "btn-1", type: "button", props: { label: "Click Me" } },
    ],
  };
}

describe("Canvas", () => {
  it("shows empty state when no document loaded", () => {
    const { getByText } = render(<Canvas />);
    expect(
      getByText("자연어로 UI를 생성하거나 프로젝트를 불러오세요"),
    ).toBeInTheDocument();
  });

  it("renders A2UI content when document exists", () => {
    useEditorStore.getState().loadDocument(makeDoc());

    const { getByTestId, getByText } = render(<Canvas />);
    expect(getByTestId("widget-card-1")).toBeInTheDocument();
    expect(getByText("Hello World")).toBeInTheDocument();
    expect(getByText("Click Me")).toBeInTheDocument();
  });

  it("clicking a widget selects it in EditorStore", () => {
    useEditorStore.getState().loadDocument(makeDoc());

    const { getByTestId } = render(<Canvas />);
    fireEvent.click(getByTestId("widget-btn-1"));

    expect(useEditorStore.getState().selectedWidgetId).toBe("btn-1");
  });

  it("clicking canvas background deselects widget", () => {
    useEditorStore.getState().loadDocument(makeDoc());
    useEditorStore.getState().selectWidget("btn-1");

    const { getByTestId } = render(<Canvas />);
    const canvas = getByTestId("canvas");
    fireEvent.click(canvas);

    expect(useEditorStore.getState().selectedWidgetId).toBeNull();
  });

  it("selected widget shows highlight", () => {
    useEditorStore.getState().loadDocument(makeDoc());
    useEditorStore.getState().selectWidget("btn-1");

    const { getByTestId } = render(<Canvas />);
    const btn = getByTestId("widget-btn-1");

    expect(btn.getAttribute("data-selected")).toBe("true");
  });
});
