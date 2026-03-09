import type { WidgetProps } from "./types";

export function IconWidget({
  id,
  props: widgetProps,
  style,
  selected,
  onClick,
}: WidgetProps) {
  const name = (widgetProps?.name as string) ?? "icon";

  return (
    <div
      data-testid={`widget-${id}`}
      data-selected={selected ? "true" : undefined}
      className={`cursor-pointer${selected ? " ring-2 ring-accent" : ""}`}
      style={{ width: "24px", height: "24px", ...style }}
      onClick={onClick}
      aria-label={name}
    >
      {name}
    </div>
  );
}
