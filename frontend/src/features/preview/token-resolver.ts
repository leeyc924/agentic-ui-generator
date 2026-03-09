import type { DesignTokens } from "../../lib/types";

export function resolveTokenValue(
  value: string,
  tokens?: DesignTokens,
): string {
  if (!tokens || !value.startsWith("$")) return value;

  const path = value.slice(1).split(".");
  let current: unknown = tokens;
  for (const key of path) {
    if (current == null || typeof current !== "object") return value;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : value;
}

export function resolveStyles(
  style: Readonly<Record<string, string>> | undefined,
  tokens?: DesignTokens,
): Record<string, string> {
  if (!style) return {};
  return Object.fromEntries(
    Object.entries(style).map(([key, value]) => [
      key,
      resolveTokenValue(value, tokens),
    ]),
  );
}
