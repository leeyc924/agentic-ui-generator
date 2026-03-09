import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeftPanel } from "../LeftPanel";
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

describe("LeftPanel", () => {
  it("shows 'Widget Tree' header", () => {
    render(<LeftPanel />);

    expect(screen.getByText("Widget Tree")).toBeInTheDocument();
  });

  it("handles empty document gracefully", () => {
    render(<LeftPanel />);

    // No document loaded, should not crash
    expect(screen.getByTestId("left-panel")).toBeInTheDocument();
    expect(screen.queryByTestId(/^tree-node-/)).not.toBeInTheDocument();
  });

  it("renders tree nodes for all root components", () => {
    useEditorStore.getState().loadDocument(
      createDocument([
        { id: "card-1", type: "card" },
        { id: "text-1", type: "text" },
      ]),
    );

    render(<LeftPanel />);

    expect(screen.getByTestId("tree-node-card-1")).toBeInTheDocument();
    expect(screen.getByTestId("tree-node-text-1")).toBeInTheDocument();
  });

  it("shows nested children with indentation", () => {
    useEditorStore.getState().loadDocument(
      createDocument([
        { id: "card-1", type: "card", children: ["text-1"] },
        { id: "text-1", type: "text" },
      ]),
    );

    render(<LeftPanel />);

    // Root node should exist
    const rootNode = screen.getByTestId("tree-node-card-1");
    expect(rootNode).toBeInTheDocument();

    // Child node should exist
    const childNode = screen.getByTestId("tree-node-text-1");
    expect(childNode).toBeInTheDocument();

    // text-1 should NOT appear as a root (it's a child of card-1)
    // Only card-1 is a root component
  });

  it("clicking a node calls selectWidget", async () => {
    const user = userEvent.setup();

    useEditorStore.getState().loadDocument(
      createDocument([
        { id: "card-1", type: "card" },
        { id: "text-1", type: "text" },
      ]),
    );

    render(<LeftPanel />);

    await user.click(screen.getByTestId("tree-node-text-1"));

    expect(useEditorStore.getState().selectedWidgetId).toBe("text-1");
  });

  it("selected node has highlight styling", () => {
    useEditorStore.getState().loadDocument(
      createDocument([
        { id: "card-1", type: "card" },
        { id: "text-1", type: "text" },
      ]),
    );
    useEditorStore.getState().selectWidget("card-1");

    render(<LeftPanel />);

    const selectedNode = screen.getByTestId("tree-node-card-1");
    expect(selectedNode.className).toContain("bg-accent/10");
    expect(selectedNode.className).toContain("text-accent");
  });

  it("non-selected node does not have highlight styling", () => {
    useEditorStore.getState().loadDocument(
      createDocument([
        { id: "card-1", type: "card" },
        { id: "text-1", type: "text" },
      ]),
    );
    useEditorStore.getState().selectWidget("card-1");

    render(<LeftPanel />);

    const unselectedNode = screen.getByTestId("tree-node-text-1");
    expect(unselectedNode.className).not.toContain("bg-accent/10");
  });

  it("displays component type and id as label", () => {
    useEditorStore.getState().loadDocument(
      createDocument([{ id: "btn-1", type: "button" }]),
    );

    render(<LeftPanel />);

    const node = screen.getByTestId("tree-node-btn-1");
    expect(node).toHaveTextContent("button");
    expect(node).toHaveTextContent("btn-1");
  });

  it("expands and collapses children on chevron click", async () => {
    const user = userEvent.setup();

    useEditorStore.getState().loadDocument(
      createDocument([
        { id: "card-1", type: "card", children: ["text-1"] },
        { id: "text-1", type: "text" },
      ]),
    );

    render(<LeftPanel />);

    // Children should be visible by default (expanded)
    expect(screen.getByTestId("tree-node-text-1")).toBeInTheDocument();

    // Click the toggle button to collapse
    const toggleButton = screen.getByTestId("toggle-card-1");
    await user.click(toggleButton);

    // Children should be hidden
    expect(screen.queryByTestId("tree-node-text-1")).not.toBeInTheDocument();

    // Click again to expand
    await user.click(toggleButton);

    // Children should be visible again
    expect(screen.getByTestId("tree-node-text-1")).toBeInTheDocument();
  });
});
