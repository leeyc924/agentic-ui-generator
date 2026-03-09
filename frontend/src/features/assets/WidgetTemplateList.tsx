import { useState } from "react";
import { LayoutTemplate, Save } from "lucide-react";
import { useAssetStore } from "../../stores/asset-store";

export function WidgetTemplateList() {
  const templates = useAssetStore((s) => s.templates);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handlePreview = (id: string) => {
    setPreviewId((prev) => (prev === id ? null : id));
  };

  return (
    <div data-testid="widget-template-list" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5" />
          Widget Templates
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-accent text-white hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          템플릿 저장
        </button>
      </div>

      {templates.length === 0 ? (
        <p className="text-text-muted text-sm">템플릿이 없습니다</p>
      ) : (
        <ul className="space-y-2">
          {templates.map((tpl) => (
            <li
              key={tpl.id}
              className="border border-border rounded-md overflow-hidden"
            >
              <button
                type="button"
                onClick={() => handlePreview(tpl.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface transition-colors"
              >
                <span className="font-medium">{tpl.name}</span>
                {tpl.category && (
                  <span className="px-1.5 py-0.5 text-xs rounded bg-accent/20 text-accent">
                    {tpl.category}
                  </span>
                )}
              </button>
              {previewId === tpl.id && (
                <pre className="px-3 py-2 text-xs bg-surface text-text-muted overflow-auto max-h-64 border-t border-border">
                  {JSON.stringify(tpl.template, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
