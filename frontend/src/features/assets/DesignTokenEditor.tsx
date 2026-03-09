import { useState } from "react";
import {
  Palette,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Copy,
  Trash2,
} from "lucide-react";
import { useAssetStore } from "../../stores/asset-store";

export function DesignTokenEditor() {
  const designTokenSets = useAssetStore((s) => s.designTokenSets);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filtered = designTokenSets.filter(
    (ts) =>
      search === "" || ts.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div data-testid="design-token-editor" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Design Tokens
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-accent text-white hover:opacity-90 cursor-pointer transition-opacity"
        >
          <Plus className="w-4 h-4" />
          새 토큰 세트
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="토큰 세트 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Palette className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            {search ? "검색 결과가 없습니다" : "토큰 세트가 없습니다"}
          </p>
          <p className="text-text-muted/60 text-xs mt-1">
            새 토큰 세트를 추가하여 디자인 시스템을 구성하세요
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((tokenSet) => {
            const tokenCount = Object.keys(tokenSet.tokens).length;
            return (
              <li
                key={tokenSet.id}
                className="border border-border rounded-md overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(tokenSet.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-text-primary hover:bg-surface cursor-pointer transition-colors"
                >
                  {expandedId === tokenSet.id ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="flex-1">{tokenSet.name}</span>
                  <span className="text-xs text-text-muted">
                    {tokenCount}개 토큰
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1 rounded hover:bg-surface-elevated text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                    aria-label="복사"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1 rounded hover:bg-error/10 text-text-muted hover:text-error cursor-pointer transition-colors"
                    aria-label="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </button>
                {expandedId === tokenSet.id && (
                  <pre className="px-3 py-2 text-xs bg-surface text-text-muted overflow-auto max-h-64 border-t border-border font-mono">
                    {JSON.stringify(tokenSet.tokens, null, 2)}
                  </pre>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
