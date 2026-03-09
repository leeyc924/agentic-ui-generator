import { describe, it, expect } from "vitest";
import type { A2UIComponent, A2UIDocument, ComponentType } from "../types";

describe("A2UI Types", () => {
  it("creates a valid component", () => {
    const comp: A2UIComponent = {
      id: "btn-1",
      type: "button",
      props: { label: "Click" },
    };
    expect(comp.id).toBe("btn-1");
    expect(comp.type).toBe("button");
  });

  it("creates a component with all optional fields", () => {
    const comp: A2UIComponent = {
      id: "card-1",
      type: "card",
      children: ["text-1", "btn-1"],
      props: { elevated: true },
      style: { padding: "16px", background: "#fff" },
    };
    expect(comp.children).toHaveLength(2);
    expect(comp.style?.padding).toBe("16px");
  });

  it("creates a valid document", () => {
    const doc: A2UIDocument = {
      version: "0.1.0",
      components: [{ id: "btn-1", type: "button" }],
      designTokens: {
        colors: { primary: "#3B82F6" },
      },
    };
    expect(doc.version).toBe("0.1.0");
    expect(doc.components).toHaveLength(1);
  });

  it("creates a document without optional designTokens", () => {
    const doc: A2UIDocument = {
      version: "0.1.0",
      components: [],
    };
    expect(doc.designTokens).toBeUndefined();
    expect(doc.components).toHaveLength(0);
  });

  it("supports all component types", () => {
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
    expect(types).toHaveLength(12);
  });
});
