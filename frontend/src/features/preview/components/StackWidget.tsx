import type { WidgetProps } from "./types";

export function StackWidget({
  id,
  props: widgetProps,
  style,
  selected,
  onClick,
  children,
}: WidgetProps) {
  const direction = (widgetProps?.direction as string) ?? "vertical";

  return (
    <div
      data-testid={`widget-${id}`}
      data-selected={selected ? "true" : undefined}
      className={`cursor-pointer${selected ? " ring-2 ring-accent" : ""}`}
      style={{
        display: "flex",
        flexDirection: direction === "horizontal" ? "row" : "column",
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
