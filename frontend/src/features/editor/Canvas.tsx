import { useEditorStore } from "../../stores/editor-store";
import { A2UIRenderer } from "../preview/A2UIRenderer";

export function Canvas() {
  const document = useEditorStore((s) => s.document);
  const selectedWidgetId = useEditorStore((s) => s.selectedWidgetId);
  const selectWidget = useEditorStore((s) => s.selectWidget);

  if (!document) {
    return (
      <div
        data-testid="canvas"
        className="flex-1 flex items-center justify-center bg-bg text-text-muted"
      >
        <p>자연어로 UI를 생성하거나 프로젝트를 불러오세요</p>
      </div>
    );
  }

  return (
    <div
      data-testid="canvas"
      className="flex-1 overflow-auto bg-bg p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          selectWidget(null);
        }
      }}
    >
      <div className="max-w-4xl mx-auto">
        <A2UIRenderer
          document={document}
          onWidgetClick={selectWidget}
          selectedWidgetId={selectedWidgetId}
        />
      </div>
    </div>
  );
}
