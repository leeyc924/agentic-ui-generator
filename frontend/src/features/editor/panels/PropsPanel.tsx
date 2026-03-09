import type { A2UIComponent } from "../../../lib/types";
import { useEditorStore } from "../../../stores/editor-store";

interface PropsPanelProps {
  readonly widget: A2UIComponent;
}

const TEXTAREA_PROPS = new Set(["content"]);
const CHECKBOX_PROPS = new Set(["required"]);

const VARIANT_OPTIONS: Record<string, readonly string[]> = {
  variant: ["heading", "body", "caption"],
  direction: ["horizontal", "vertical"],
};

function PropField({
  propKey,
  value,
  onChange,
}: {
  readonly propKey: string;
  readonly value: unknown;
  readonly onChange: (key: string, value: unknown) => void;
}) {
  const id = `prop-${propKey}`;

  if (CHECKBOX_PROPS.has(propKey)) {
    return (
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm text-text-primary">
          {propKey}
        </label>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(propKey, e.target.checked)}
          className="accent-accent"
        />
      </div>
    );
  }

  if (propKey in VARIANT_OPTIONS) {
    const options = VARIANT_OPTIONS[propKey];
    return (
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm text-text-primary shrink-0">
          {propKey}
        </label>
        <select
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(propKey, e.target.value)}
          className="flex-1 min-w-0 text-sm bg-surface-elevated border border-border rounded px-2 py-1 text-text-primary"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (propKey === "options") {
    return (
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm text-text-primary shrink-0">
          {propKey}
        </label>
        <input
          id={id}
          type="text"
          value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
          onChange={(e) =>
            onChange(
              propKey,
              e.target.value.split(",").map((s) => s.trim()),
            )
          }
          placeholder="opt1, opt2, opt3"
          className="flex-1 min-w-0 text-sm bg-surface-elevated border border-border rounded px-2 py-1 text-text-primary"
        />
      </div>
    );
  }

  if (TEXTAREA_PROPS.has(propKey)) {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm text-text-primary">
          {propKey}
        </label>
        <textarea
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(propKey, e.target.value)}
          rows={3}
          className="text-sm bg-surface-elevated border border-border rounded px-2 py-1 text-text-primary resize-y"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={id} className="text-sm text-text-primary shrink-0">
        {propKey}
      </label>
      <input
        id={id}
        type="text"
        value={String(value ?? "")}
        onChange={(e) => onChange(propKey, e.target.value)}
        className="flex-1 min-w-0 text-sm bg-surface-elevated border border-border rounded px-2 py-1 text-text-primary"
      />
    </div>
  );
}

export function PropsPanel({ widget }: PropsPanelProps) {
  const updateWidget = useEditorStore((s) => s.updateWidget);
  const props = widget.props ?? {};
  const entries = Object.entries(props);

  const handleChange = (key: string, value: unknown) => {
    updateWidget(widget.id, {
      props: { ...props, [key]: value },
    });
  };

  if (entries.length === 0) {
    return (
      <p className="text-sm text-text-muted px-3 py-2">No props available</p>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-3 py-2">
      {entries.map(([key, value]) => (
        <PropField
          key={key}
          propKey={key}
          value={value}
          onChange={handleChange}
        />
      ))}
    </div>
  );
}
