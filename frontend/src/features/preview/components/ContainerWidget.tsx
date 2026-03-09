import type { WidgetProps } from "./types";

export function ContainerWidget({
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
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
