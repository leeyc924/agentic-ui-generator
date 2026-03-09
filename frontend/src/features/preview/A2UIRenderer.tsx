import type { A2UIComponent, A2UIDocument } from "../../lib/types";
import { resolveStyles } from "./token-resolver";
import { WIDGET_MAP } from "./components";

interface A2UIRendererProps {
  readonly document: A2UIDocument;
  readonly onWidgetClick?: (id: string) => void;
  readonly selectedWidgetId?: string | null;
}

export function A2UIRenderer({
  document: doc,
  onWidgetClick,
  selectedWidgetId,
}: A2UIRendererProps) {
  const { components, designTokens } = doc;

  const componentMap = new Map(components.map((c) => [c.id, c]));

  const childIds = new Set(components.flatMap((c) => c.children ?? []));
  const roots = components.filter((c) => !childIds.has(c.id));

  function renderComponent(comp: A2UIComponent): React.ReactNode {
    const Widget = WIDGET_MAP[comp.type];
    if (!Widget) return null;

    const resolvedStyle = resolveStyles(comp.style, designTokens);
    const children = comp.children?.map((childId) => {
      const child = componentMap.get(childId);
      return child ? renderComponent(child) : null;
    });

    return (
      <Widget
        key={comp.id}
        id={comp.id}
        props={comp.props}
        style={resolvedStyle}
        selected={comp.id === selectedWidgetId}
        onClick={() => onWidgetClick?.(comp.id)}
      >
        {children}
      </Widget>
    );
  }

  return <div className="a2ui-root">{roots.map(renderComponent)}</div>;
}
