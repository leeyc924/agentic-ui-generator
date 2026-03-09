import type { WidgetProps } from "./types";

interface SelectOption {
  readonly label: string;
  readonly value: string;
}

export function SelectWidget({
  id,
  props: widgetProps,
  style,
  selected,
  onClick,
}: WidgetProps) {
  const label = widgetProps?.label as string | undefined;
  const options = (widgetProps?.options as readonly SelectOption[]) ?? [];

  return (
    <div
      data-testid={`widget-${id}`}
      data-selected={selected ? "true" : undefined}
      className={`cursor-pointer${selected ? " ring-2 ring-accent" : ""}`}
      style={style}
      onClick={onClick}
    >
      {label && <label>{label}</label>}
      <select>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
