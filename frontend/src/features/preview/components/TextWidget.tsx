import type { WidgetProps } from "./types";

const VARIANT_TAG_MAP: Record<string, keyof JSX.IntrinsicElements> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
};

export function TextWidget({
  id,
  props: widgetProps,
  style,
  selected,
  onClick,
}: WidgetProps) {
  const variant = widgetProps?.variant as string | undefined;
  const content = (widgetProps?.content as string) ?? "";
  const Tag = (variant && VARIANT_TAG_MAP[variant]) || "p";

  return (
    <Tag
      data-testid={`widget-${id}`}
      data-selected={selected ? "true" : undefined}
      className={`cursor-pointer${selected ? " ring-2 ring-accent" : ""}`}
      style={style}
      onClick={onClick}
    >
      {content}
    </Tag>
  );
}
