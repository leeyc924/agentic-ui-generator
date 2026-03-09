import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RightPanel } from "../RightPanel";
import { useEditorStore } from "../../../stores/editor-store";
import type { A2UIDocument } from "../../../lib/types";

afterEach(() => {
  cleanup();
  useEditorStore.getState().reset();
});

const createDocument = (
  ...components: A2UIDocument["components"]
): A2UIDocument => ({
  version: "1.0",
  components: components.flat(),
});

describe("RightPanel", () => {
  it("shows placeholder when no widget selected", () => {
    render(<RightPanel />);

    expect(screen.getByText("위젯을 선택하세요")).toBeInTheDocument();
  });

  it("shows props for selected widget", () => {
    useEditorStore.getState().loadDocument(
      createDocument([
        {
          id: "btn-1",
          type: "button",
          props: { label: "Click me" },
        },
      ]),
    );
    useEditorStore.getState().selectWidget("btn-1");

    render(<RightPanel />);

    expect(screen.getByText("Props")).toBeInTheDocument();
    expect(screen.getByLabelText("label")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Click me")).toBeInTheDocument();
  });

  it("shows style editor for selected widget", () => {
    useEditorStore.getState().loadDocument(
      createDocument([
        {
          id: "card-1",
          type: "card",
          style: { padding: "16px" },
        },
      ]),
    );
    useEditorStore.getState().selectWidget("card-1");

    render(<RightPanel />);

    expect(screen.getByText("Style")).toBeInTheDocument();
    expect(screen.getByDisplayValue("16px")).toBeInTheDocument();
  });

  it("editing a prop value calls updateWidget", async () => {
    const user = userEvent.setup();

    useEditorStore.getState().loadDocument(
      createDocument([
        {
          id: "btn-1",
          type: "button",
          props: { label: "Click me" },
        },
      ]),
    );
    useEditorStore.getState().selectWidget("btn-1");

    render(<RightPanel />);

    const input = screen.getByLabelText("label");
    await user.clear(input);
    await user.type(input, "Submit");

    const doc = useEditorStore.getState().document;
    const widget = doc?.components.find((c) => c.id === "btn-1");
    expect(widget?.props?.label).toBe("Submit");
  });

  it("editing a style value calls updateWidget", async () => {
    const user = userEvent.setup();

    useEditorStore.getState().loadDocument(
      createDocument([
        {
          id: "card-1",
          type: "card",
          style: { padding: "16px" },
        },
      ]),
    );
    useEditorStore.getState().selectWidget("card-1");

    render(<RightPanel />);

    const paddingInput = screen.getByLabelText("padding");
    await user.clear(paddingInput);
    await user.type(paddingInput, "24px");

    const doc = useEditorStore.getState().document;
    const widget = doc?.components.find((c) => c.id === "card-1");
    expect(widget?.style?.padding).toBe("24px");
  });

  it("updates when selected widget changes", () => {
    useEditorStore.getState().loadDocument(
      createDocument([
        {
          id: "btn-1",
          type: "button",
          props: { label: "Button" },
        },
        {
          id: "text-1",
          type: "text",
          props: { content: "Hello" },
        },
      ]),
    );
    useEditorStore.getState().selectWidget("btn-1");

    const { rerender } = render(<RightPanel />);

    expect(screen.getByDisplayValue("Button")).toBeInTheDocument();

    useEditorStore.getState().selectWidget("text-1");
    rerender(<RightPanel />);

    expect(screen.getByDisplayValue("Hello")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Button")).not.toBeInTheDocument();
  });
});
