import type { WidgetProps } from "./types";

export function TextFieldWidget({
  id,
  props: widgetProps,
  style,
  selected,
  onClick,
}: WidgetProps) {
  const label = widgetProps?.label as string | undefined;
  const placeholder = (widgetProps?.placeholder as string) ?? "";

  return (
    <div
      data-testid={`widget-${id}`}
      data-selected={selected ? "true" : undefined}
      className={`cursor-pointer${selected ? " ring-2 ring-accent" : ""}`}
      style={style}
      onClick={onClick}
    >
      {label && <label>{label}</label>}
      <input type="text" placeholder={placeholder} readOnly />
    </div>
  );
}
