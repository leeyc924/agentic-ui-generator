import type { WidgetProps } from "./types";

export function CardWidget({
  id,
  style,
  selected,
  onClick,
  children,
}: WidgetProps) {
  return (
    <div
      data-testid={`widget-${id}`}
      data-selected={selected ? "true" : undefined}
      className={`cursor-pointer${selected ? " ring-2 ring-accent" : ""}`}
      style={{
        padding: "16px",
        borderRadius: "8px",
        background: "#fff",
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
