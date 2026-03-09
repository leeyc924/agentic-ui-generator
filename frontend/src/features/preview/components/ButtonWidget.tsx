import type { WidgetProps } from "./types";

export function ButtonWidget({
  id,
  props: widgetProps,
  style,
  selected,
  onClick,
}: WidgetProps) {
  const label = (widgetProps?.label as string) ?? "Button";

  return (
    <button
      data-testid={`widget-${id}`}
      data-selected={selected ? "true" : undefined}
      className={`cursor-pointer${selected ? " ring-2 ring-accent" : ""}`}
      style={style}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
