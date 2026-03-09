import { useState } from "react";
import { Palette, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { useAssetStore } from "../../stores/asset-store";

export function DesignTokenEditor() {
  const designTokenSets = useAssetStore((s) => s.designTokenSets);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div data-testid="design-token-editor" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Design Tokens
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-accent text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          새 토큰 세트
        </button>
      </div>

      {designTokenSets.length === 0 ? (
        <p className="text-text-muted text-sm">토큰 세트가 없습니다</p>
      ) : (
        <ul className="space-y-2">
          {designTokenSets.map((tokenSet) => (
            <li
              key={tokenSet.id}
              className="border border-border rounded-md overflow-hidden"
            >
              <button
                type="button"
                onClick={() => handleToggle(tokenSet.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-text-primary hover:bg-surface transition-colors"
              >
                {expandedId === tokenSet.id ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                {tokenSet.name}
              </button>
              {expandedId === tokenSet.id && (
                <pre className="px-3 py-2 text-xs bg-surface text-text-muted overflow-auto max-h-64 border-t border-border">
                  {JSON.stringify(tokenSet.tokens, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
