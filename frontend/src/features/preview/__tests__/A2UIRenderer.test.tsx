import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { A2UIRenderer } from "../A2UIRenderer";
import type { A2UIDocument, ComponentType } from "../../../lib/types";

afterEach(cleanup);

function makeDoc(overrides: Partial<A2UIDocument> = {}): A2UIDocument {
  return {
    version: "0.1.0",
    components: [],
    ...overrides,
  };
}

describe("A2UIRenderer", () => {
  it("renders a simple document with one button", () => {
    const doc = makeDoc({
      components: [
        { id: "btn-simple", type: "button", props: { label: "Click Me" } },
      ],
    });
    const { getByText, getByTestId } = render(
      <A2UIRenderer document={doc} />,
    );
    expect(getByText("Click Me")).toBeInTheDocument();
    expect(getByTestId("widget-btn-simple")).toBeInTheDocument();
  });

  it("renders nested components (card with children)", () => {
    const doc = makeDoc({
      components: [
        {
          id: "card-nest",
          type: "card",
          children: ["text-nest", "btn-nest"],
        },
        { id: "text-nest", type: "text", props: { content: "Hello" } },
        { id: "btn-nest", type: "button", props: { label: "OK" } },
      ],
    });
    const { getByTestId } = render(<A2UIRenderer document={doc} />);

    const card = getByTestId("widget-card-nest");
    const text = getByTestId("widget-text-nest");
    const btn = getByTestId("widget-btn-nest");

    expect(card).toContainElement(text);
    expect(card).toContainElement(btn);
  });

  it("resolves design tokens in styles", () => {
    const doc = makeDoc({
      designTokens: { colors: { primary: "#3B82F6" } },
      components: [
        {
          id: "btn-token",
          type: "button",
          props: { label: "Styled" },
          style: { backgroundColor: "$colors.primary" },
        },
      ],
    });
    const { getByTestId } = render(<A2UIRenderer document={doc} />);

    const btn = getByTestId("widget-btn-token");
    expect(btn.style.backgroundColor).toBe("#3B82F6");
  });

  it("calls onWidgetClick when widget is clicked", () => {
    const handleClick = vi.fn();
    const doc = makeDoc({
      components: [
        { id: "btn-click", type: "button", props: { label: "Click" } },
      ],
    });
    const { getByTestId } = render(
      <A2UIRenderer document={doc} onWidgetClick={handleClick} />,
    );

    fireEvent.click(getByTestId("widget-btn-click"));
    expect(handleClick).toHaveBeenCalledWith("btn-click");
  });

  it("shows selection outline on selected widget", () => {
    const doc = makeDoc({
      components: [
        { id: "btn-sel", type: "button", props: { label: "Selected" } },
      ],
    });
    const { getByTestId } = render(
      <A2UIRenderer document={doc} selectedWidgetId="btn-sel" />,
    );

    const btn = getByTestId("widget-btn-sel");
    expect(btn.getAttribute("data-selected")).toBe("true");
  });

  it("handles empty document", () => {
    const doc = makeDoc({ components: [] });
    const { container } = render(<A2UIRenderer document={doc} />);
    const root = container.querySelector(".a2ui-root");
    expect(root).toBeInTheDocument();
    expect(root?.children).toHaveLength(0);
  });

  it("renders all 12 component types without errors", () => {
    const types: ComponentType[] = [
      "card",
      "text",
      "button",
      "text-field",
      "select",
      "checkbox",
      "image",
      "icon",
      "divider",
      "container",
      "grid",
      "stack",
    ];
    const doc = makeDoc({
      components: types.map((type, i) => ({
        id: `all-${type}-${i}`,
        type,
        props: {
          label: "Test",
          content: "Test",
          src: "https://example.com/img.png",
          alt: "test",
          placeholder: "test",
          options: [
            { label: "A", value: "a" },
            { label: "B", value: "b" },
          ],
        },
      })),
    });

    const { container } = render(<A2UIRenderer document={doc} />);
    for (const type of types) {
      const idx = types.indexOf(type);
      expect(
        container.querySelector(`[data-testid="widget-all-${type}-${idx}"]`),
      ).toBeInTheDocument();
    }
  });
});
