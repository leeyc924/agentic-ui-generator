import { useCallback, useMemo } from "react";
import { Layers } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useEditorStore } from "../../stores/editor-store";
import { WidgetTreeNode } from "./WidgetTreeNode";

export function LeftPanel() {
  const document = useEditorStore((s) => s.document);
  const selectedWidgetId = useEditorStore((s) => s.selectedWidgetId);
  const selectWidget = useEditorStore((s) => s.selectWidget);
  const moveWidget = useEditorStore((s) => s.moveWidget);

  const components = document?.components ?? [];

  const roots = useMemo(() => {
    const childIds = new Set(components.flatMap((c) => c.children ?? []));
    return components.filter((c) => !childIds.has(c.id));
  }, [components]);

  const allIds = useMemo(
    () => components.map((c) => c.id),
    [components],
  );

  const handleSelect = useCallback(
    (id: string) => {
      selectWidget(id);
    },
    [selectWidget],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      // Find the parent of the over element to use as the new parent
      const overParent = components.find((c) =>
        c.children?.includes(overId),
      );

      if (overParent) {
        const overIndex = overParent.children!.indexOf(overId);
        moveWidget(activeId, overParent.id, overIndex);
      }
    },
    [components, moveWidget],
  );

  return (
    <div
      data-testid="left-panel"
      className="h-full bg-surface border-r border-border flex flex-col overflow-hidden"
    >
      <div className="h-10 flex items-center gap-2 px-3 border-b border-border">
        <Layers className="w-4 h-4 text-text-muted" />
        <h2 className="text-sm font-semibold text-text-primary">
          Widget Tree
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {components.length === 0 ? (
          <p className="text-sm text-text-muted p-2">
            위젯이 없습니다
          </p>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={allIds}
              strategy={verticalListSortingStrategy}
            >
              {roots.map((root) => (
                <WidgetTreeNode
                  key={root.id}
                  component={root}
                  allComponents={components}
                  depth={0}
                  selectedWidgetId={selectedWidgetId}
                  onSelect={handleSelect}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
