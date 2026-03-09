import type { WidgetProps } from "./types";

export function CheckboxWidget({
  id,
  props: widgetProps,
  style,
  selected,
  onClick,
}: WidgetProps) {
  const label = (widgetProps?.label as string) ?? "";

  return (
    <div
      data-testid={`widget-${id}`}
      data-selected={selected ? "true" : undefined}
      className={`cursor-pointer${selected ? " ring-2 ring-accent" : ""}`}
      style={style}
      onClick={onClick}
    >
      <label>
        <input type="checkbox" readOnly />
        {label}
      </label>
    </div>
  );
}
