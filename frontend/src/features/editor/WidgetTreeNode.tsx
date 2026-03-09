import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { A2UIComponent } from "../../lib/types";

interface WidgetTreeNodeProps {
  readonly component: A2UIComponent;
  readonly allComponents: readonly A2UIComponent[];
  readonly depth: number;
  readonly selectedWidgetId: string | null;
  readonly onSelect: (id: string) => void;
}

export function WidgetTreeNode({
  component,
  allComponents,
  depth,
  selectedWidgetId,
  onSelect,
}: WidgetTreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren =
    component.children !== undefined && component.children.length > 0;
  const isSelected = selectedWidgetId === component.id;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  const children = hasChildren
    ? component
        .children!.map((childId) => allComponents.find((c) => c.id === childId))
        .filter((c): c is A2UIComponent => c !== undefined)
    : [];

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const handleSelect = () => {
    onSelect(component.id);
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        data-testid={`tree-node-${component.id}`}
        className={`flex items-center h-7 cursor-pointer rounded text-sm ${
          isSelected
            ? "bg-accent/10 text-accent"
            : "text-text-secondary hover:bg-surface-hover"
        }`}
        onClick={handleSelect}
      >
        <div
          style={{ paddingLeft: `${depth * 16}px` }}
          className="flex items-center gap-1 flex-1 min-w-0 px-1"
        >
          {hasChildren ? (
            <button
              data-testid={`toggle-${component.id}`}
              className="flex items-center justify-center w-4 h-4 shrink-0"
              onClick={handleToggle}
            >
              {expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}
          <span {...listeners} className="truncate cursor-grab">
            {component.type}{" "}
            <span className="text-text-muted text-xs">{component.id}</span>
          </span>
        </div>
      </div>
      {hasChildren && expanded && (
        <div>
          {children.map((child) => (
            <WidgetTreeNode
              key={child.id}
              component={child}
              allComponents={allComponents}
              depth={depth + 1}
              selectedWidgetId={selectedWidgetId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
