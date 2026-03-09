import { Image, Upload } from "lucide-react";
import { useAssetStore } from "../../stores/asset-store";

export function IconGallery() {
  const icons = useAssetStore((s) => s.icons);

  return (
    <div data-testid="icon-gallery" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Image className="w-5 h-5" />
          Icons
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-accent text-white hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          아이콘 업로드
        </button>
      </div>

      {icons.length === 0 ? (
        <p className="text-text-muted text-sm">아이콘이 없습니다</p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
          {icons.map((icon) => (
            <div
              key={icon.id}
              className="flex flex-col items-center gap-1 p-2 border border-border rounded-md hover:bg-surface transition-colors"
            >
              <img
                src={icon.filePath}
                alt={icon.name}
                className="w-8 h-8 object-contain"
              />
              <span className="text-xs text-text-muted truncate w-full text-center">
                {icon.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
