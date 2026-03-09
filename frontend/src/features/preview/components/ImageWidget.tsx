import type { WidgetProps } from "./types";

export function ImageWidget({
  id,
  props: widgetProps,
  style,
  selected,
  onClick,
}: WidgetProps) {
  const src = (widgetProps?.src as string) ?? "";
  const alt = (widgetProps?.alt as string) ?? "";

  return (
    <img
      data-testid={`widget-${id}`}
      data-selected={selected ? "true" : undefined}
      className={`cursor-pointer${selected ? " ring-2 ring-accent" : ""}`}
      style={style}
      onClick={onClick}
      src={src}
      alt={alt}
    />
  );
}
