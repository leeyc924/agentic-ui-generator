import { useState } from "react";
import type { A2UIComponent } from "../../../lib/types";
import { useEditorStore } from "../../../stores/editor-store";

interface StylePanelProps {
  readonly widget: A2UIComponent;
}

interface StyleSection {
  readonly title: string;
  readonly fields: readonly StyleField[];
}

interface StyleField {
  readonly key: string;
  readonly type: "text" | "color" | "dropdown" | "range" | "buttonGroup";
  readonly options?: readonly string[];
}

const STYLE_SECTIONS: readonly StyleSection[] = [
  {
    title: "Layout",
    fields: [
      { key: "display", type: "dropdown", options: ["block", "flex", "grid"] },
      {
        key: "flexDirection",
        type: "dropdown",
        options: ["row", "column"],
      },
      { key: "gap", type: "text" },
      { key: "padding", type: "text" },
      { key: "margin", type: "text" },
    ],
  },
  {
    title: "Dimensions",
    fields: [
      { key: "width", type: "text" },
      { key: "height", type: "text" },
      { key: "minWidth", type: "text" },
      { key: "maxWidth", type: "text" },
    ],
  },
  {
    title: "Appearance",
    fields: [
      { key: "background", type: "color" },
      { key: "borderRadius", type: "text" },
      { key: "opacity", type: "range" },
      { key: "border", type: "text" },
    ],
  },
  {
    title: "Text",
    fields: [
      { key: "color", type: "color" },
      { key: "fontSize", type: "text" },
      {
        key: "fontWeight",
        type: "dropdown",
        options: ["300", "400", "500", "600", "700"],
      },
      {
        key: "textAlign",
        type: "buttonGroup",
        options: ["left", "center", "right"],
      },
    ],
  },
];

function StyleFieldInput({
  field,
  value,
  onChange,
}: {
  readonly field: StyleField;
  readonly value: string;
  readonly onChange: (key: string, value: string) => void;
}) {
  const id = `style-${field.key}`;

  if (field.type === "dropdown") {
    return (
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm text-text-primary shrink-0">
          {field.key}
        </label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          className="flex-1 min-w-0 text-sm bg-surface-elevated border border-border rounded px-2 py-1 text-text-primary"
        >
          <option value="">-</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "color") {
    return (
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm text-text-primary shrink-0">
          {field.key}
        </label>
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="w-6 h-6 border border-border rounded cursor-pointer"
          />
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder="e.g. $colors.primary"
            className="flex-1 min-w-0 text-sm bg-surface-elevated border border-border rounded px-2 py-1 text-text-primary"
          />
        </div>
      </div>
    );
  }

  if (field.type === "range") {
    const numValue = parseInt(value, 10) || 100;
    return (
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm text-text-primary shrink-0">
          {field.key}
        </label>
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <input
            id={id}
            type="range"
            min="0"
            max="100"
            value={numValue}
            onChange={(e) => onChange(field.key, `${e.target.value}%`)}
            className="flex-1"
          />
          <span className="text-xs text-text-muted w-8 text-right">
            {value || "100%"}
          </span>
        </div>
      </div>
    );
  }

  if (field.type === "buttonGroup") {
    return (
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm text-text-primary shrink-0">
          {field.key}
        </label>
        <div className="flex border border-border rounded overflow-hidden">
          {field.options?.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(field.key, opt)}
              className={`px-2 py-1 text-xs ${
                value === opt
                  ? "bg-accent text-white"
                  : "bg-surface-elevated text-text-primary hover:bg-surface"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={id} className="text-sm text-text-primary shrink-0">
        {field.key}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="flex-1 min-w-0 text-sm bg-surface-elevated border border-border rounded px-2 py-1 text-text-primary"
      />
    </div>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
}: {
  readonly title: string;
  readonly children: React.ReactNode;
  readonly defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-surface-elevated text-left"
      >
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
          {title}
        </span>
        <span className="text-xs text-text-muted">
          {expanded ? "▾" : "▸"}
        </span>
      </button>
      {expanded && (
        <div className="flex flex-col gap-2 px-3 pb-2">{children}</div>
      )}
    </div>
  );
}

export function StylePanel({ widget }: StylePanelProps) {
  const updateWidget = useEditorStore((s) => s.updateWidget);
  const style = widget.style ?? {};

  const handleChange = (key: string, value: string) => {
    updateWidget(widget.id, {
      style: { ...style, [key]: value },
    });
  };

  return (
    <div className="flex flex-col">
      {STYLE_SECTIONS.map((section) => (
        <CollapsibleSection key={section.title} title={section.title}>
          {section.fields.map((field) => (
            <StyleFieldInput
              key={field.key}
              field={field}
              value={style[field.key] ?? ""}
              onChange={handleChange}
            />
          ))}
        </CollapsibleSection>
      ))}
    </div>
  );
}
