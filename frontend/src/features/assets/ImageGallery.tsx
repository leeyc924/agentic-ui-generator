import { ImageIcon, Upload } from "lucide-react";
import { useAssetStore } from "../../stores/asset-store";

export function ImageGallery() {
  const images = useAssetStore((s) => s.images);

  return (
    <div data-testid="image-gallery" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Images
        </h2>
        <button
          type="button"
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-accent text-white hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          이미지 업로드
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-text-muted text-sm">이미지가 없습니다</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="flex flex-col items-center gap-1 p-2 border border-border rounded-md hover:bg-surface transition-colors"
            >
              <img
                src={image.filePath}
                alt={image.name}
                className="w-full h-24 object-cover rounded"
              />
              <span className="text-xs text-text-muted truncate w-full text-center">
                {image.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
