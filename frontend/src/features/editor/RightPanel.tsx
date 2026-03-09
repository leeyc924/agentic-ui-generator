import { useEditorStore } from "../../stores/editor-store";
import { INTERACTIVE_TYPES } from "../../lib/types";
import { PropsPanel } from "./panels/PropsPanel";
import { StylePanel } from "./panels/StylePanel";
import { WorkflowPanel } from "./panels/WorkflowPanel";

export function RightPanel() {
  const document = useEditorStore((s) => s.document);
  const selectedWidgetId = useEditorStore((s) => s.selectedWidgetId);

  const selectedWidget = document?.components.find(
    (c) => c.id === selectedWidgetId,
  );

  const isInteractive =
    selectedWidget != null &&
    INTERACTIVE_TYPES.includes(selectedWidget.type);

  return (
    <div
      data-testid="right-panel"
      className="h-full bg-surface border-l border-border flex flex-col overflow-hidden"
    >
      <div className="h-10 flex items-center px-3 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary">Properties</h2>
      </div>
      {selectedWidget == null ? (
        <div className="flex-1 p-3">
          <p className="text-sm text-text-muted">위젯을 선택하세요</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-border px-3 py-2">
            <span className="text-xs font-medium text-text-muted">
              {selectedWidget.type}
            </span>
            <span className="text-xs text-text-muted ml-1">
              #{selectedWidget.id}
            </span>
          </div>
          <div className="border-b border-border">
            <div className="px-3 py-1.5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                Props
              </h3>
            </div>
            <PropsPanel widget={selectedWidget} />
          </div>
          <div className="border-b border-border">
            <div className="px-3 py-1.5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                Style
              </h3>
            </div>
            <StylePanel widget={selectedWidget} />
          </div>
          {isInteractive && (
            <div>
              <div className="px-3 py-1.5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Workflow
                </h3>
              </div>
              <WorkflowPanel widget={selectedWidget} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
