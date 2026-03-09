import type { WidgetProps } from "./types";

export function GridWidget({
  id,
  props: widgetProps,
  style,
  selected,
  onClick,
  children,
}: WidgetProps) {
  const columns = (widgetProps?.columns as number) ?? 2;

  return (
    <div
      data-testid={`widget-${id}`}
      data-selected={selected ? "true" : undefined}
      className={`cursor-pointer${selected ? " ring-2 ring-accent" : ""}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${String(columns)}, 1fr)`,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
