import { Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { AssetsLayout } from "../features/assets/AssetsLayout";

export function AssetsPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="h-12 bg-surface border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">에디터</span>
        </Link>

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-semibold text-text-primary">자산 관리</h1>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <AssetsLayout />
      </main>
    </div>
  );
}
