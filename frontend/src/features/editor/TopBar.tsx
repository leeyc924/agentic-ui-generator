import { Link } from "react-router-dom";
import { Undo2, Redo2, Save, Package, FolderOpen } from "lucide-react";
import { useEditorStore } from "../../stores/editor-store";

export function TopBar() {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  return (
    <div
      data-testid="top-bar"
      className="h-12 bg-surface border-b border-border flex items-center px-4 gap-2"
    >
      <Link
        to="/"
        className="text-lg font-semibold text-text-primary hover:text-accent transition-colors"
      >
        A2UI
      </Link>

      <div className="w-px h-5 bg-border mx-1" />

      <Link
        to="/assets"
        className="flex items-center gap-1.5 px-2 py-1 rounded text-sm text-text-muted hover:text-text-primary hover:bg-surface-elevated cursor-pointer transition-colors"
      >
        <Package className="w-4 h-4" />
        <span>자산 관리</span>
      </Link>

      <Link
        to="/projects"
        className="flex items-center gap-1.5 px-2 py-1 rounded text-sm text-text-muted hover:text-text-primary hover:bg-surface-elevated cursor-pointer transition-colors"
      >
        <FolderOpen className="w-4 h-4" />
        <span>프로젝트</span>
      </Link>

      <div className="mr-auto" />

      <button
        aria-label="Undo"
        onClick={undo}
        className="p-1.5 rounded hover:bg-surface-elevated text-text-muted hover:text-text-primary cursor-pointer transition-colors"
      >
        <Undo2 size={20} />
      </button>

      <button
        aria-label="Redo"
        onClick={redo}
        className="p-1.5 rounded hover:bg-surface-elevated text-text-muted hover:text-text-primary cursor-pointer transition-colors"
      >
        <Redo2 size={20} />
      </button>

      <button
        aria-label="Save"
        disabled
        className="p-1.5 rounded text-text-muted opacity-50 cursor-not-allowed"
      >
        <Save size={20} />
      </button>
    </div>
  );
}
