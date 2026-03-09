import type { WidgetProps } from "./types";

export function DividerWidget({
  id,
  style,
  selected,
  onClick,
}: WidgetProps) {
  return (
    <hr
      data-testid={`widget-${id}`}
      data-selected={selected ? "true" : undefined}
      className={`cursor-pointer${selected ? " ring-2 ring-accent" : ""}`}
      style={style}
      onClick={onClick}
    />
  );
}
