import { useState } from "react";
import { Shapes, Upload, Search, Trash2 } from "lucide-react";
import { useAssetStore } from "../../stores/asset-store";

export function IconGallery() {
  const icons = useAssetStore((s) => s.icons);
  const [search, setSearch] = useState("");

  const filtered = icons.filter(
    (icon) =>
      search === "" || icon.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div data-testid="icon-gallery" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Shapes className="w-5 h-5" />
          Icons
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-accent text-white hover:opacity-90 cursor-pointer transition-opacity"
        >
          <Upload className="w-4 h-4" />
          아이콘 업로드
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="아이콘 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Shapes className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            {search ? "검색 결과가 없습니다" : "아이콘이 없습니다"}
          </p>
          <p className="text-text-muted/60 text-xs mt-1">
            SVG 아이콘을 업로드하여 프로젝트에서 사용하세요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {filtered.map((icon) => (
            <div
              key={icon.id}
              className="group relative flex flex-col items-center gap-1.5 p-3 border border-border rounded-lg hover:bg-surface hover:border-accent/50 cursor-pointer transition-all"
            >
              <img
                src={icon.filePath}
                alt={icon.name}
                className="w-8 h-8 object-contain"
              />
              <span className="text-xs text-text-muted truncate w-full text-center">
                {icon.name}
              </span>
              <button
                type="button"
                className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-error/10 text-text-muted hover:text-error cursor-pointer transition-all"
                aria-label={`${icon.name} 삭제`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
