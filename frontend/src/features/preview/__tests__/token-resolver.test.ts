import { describe, it, expect } from "vitest";
import { resolveTokenValue, resolveStyles } from "../token-resolver";
import type { DesignTokens } from "../../../lib/types";

describe("resolveTokenValue", () => {
  const tokens: DesignTokens = {
    colors: { primary: "#3B82F6", secondary: "#6B7280" },
    spacing: { sm: "8px", md: "16px" },
  };

  it("returns original value for non-token strings", () => {
    expect(resolveTokenValue("16px", tokens)).toBe("16px");
    expect(resolveTokenValue("red", tokens)).toBe("red");
  });

  it("resolves $colors.primary to actual value", () => {
    expect(resolveTokenValue("$colors.primary", tokens)).toBe("#3B82F6");
  });

  it("resolves $spacing.md to actual value", () => {
    expect(resolveTokenValue("$spacing.md", tokens)).toBe("16px");
  });

  it("returns original string for unresolved paths", () => {
    expect(resolveTokenValue("$colors.nonexistent", tokens)).toBe(
      "$colors.nonexistent",
    );
    expect(resolveTokenValue("$unknown.path", tokens)).toBe("$unknown.path");
  });

  it("returns original value when tokens are undefined", () => {
    expect(resolveTokenValue("$colors.primary", undefined)).toBe(
      "$colors.primary",
    );
  });
});

describe("resolveStyles", () => {
  const tokens: DesignTokens = {
    colors: { primary: "#3B82F6" },
    spacing: { md: "16px" },
  };

  it("resolves all token references in a style object", () => {
    const style = {
      backgroundColor: "$colors.primary",
      padding: "$spacing.md",
      border: "1px solid black",
    };
    const resolved = resolveStyles(style, tokens);
    expect(resolved).toEqual({
      backgroundColor: "#3B82F6",
      padding: "16px",
      border: "1px solid black",
    });
  });

  it("returns empty object for undefined input", () => {
    expect(resolveStyles(undefined, tokens)).toEqual({});
  });

  it("returns styles as-is when no tokens provided", () => {
    const style = { color: "$colors.primary", padding: "8px" };
    const resolved = resolveStyles(style, undefined);
    expect(resolved).toEqual({
      color: "$colors.primary",
      padding: "8px",
    });
  });
});
