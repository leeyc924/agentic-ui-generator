import { useState } from "react";
import { ImageIcon, Upload, Search, Trash2, ExternalLink } from "lucide-react";
import { useAssetStore } from "../../stores/asset-store";

export function ImageGallery() {
  const images = useAssetStore((s) => s.images);
  const [search, setSearch] = useState("");

  const filtered = images.filter(
    (img) =>
      search === "" || img.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div data-testid="image-gallery" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Images
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-accent text-white hover:opacity-90 cursor-pointer transition-opacity"
        >
          <Upload className="w-4 h-4" />
          이미지 업로드
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="이미지 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            {search ? "검색 결과가 없습니다" : "이미지가 없습니다"}
          </p>
          <p className="text-text-muted/60 text-xs mt-1">
            PNG, JPG, WebP 이미지를 업로드하세요
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((image) => (
            <div
              key={image.id}
              className="group relative flex flex-col gap-1.5 border border-border rounded-lg overflow-hidden hover:border-accent/50 cursor-pointer transition-all"
            >
              <div className="relative aspect-video bg-surface">
                <img
                  src={image.filePath}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    className="p-1.5 rounded-md bg-surface/80 text-text-primary hover:bg-surface cursor-pointer transition-colors"
                    aria-label={`${image.name} 열기`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-md bg-error/80 text-white hover:bg-error cursor-pointer transition-colors"
                    aria-label={`${image.name} 삭제`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="px-3 pb-2">
                <span className="text-xs text-text-muted truncate block">
                  {image.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
