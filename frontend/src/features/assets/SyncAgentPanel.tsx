import { RefreshCw, Download, Info } from "lucide-react";

export function SyncAgentPanel() {
  return (
    <div data-testid="sync-agent-panel" className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="w-5 h-5 text-text-primary" />
        <h2 className="text-lg font-semibold text-text-primary">Sync Agent</h2>
      </div>

      <div className="flex items-start gap-2 p-3 mb-6 rounded-md bg-accent/10 border border-accent/20">
        <Info className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
        <p className="text-sm text-text-muted">
          Sync Agent는 외부 디자인 도구에서 에셋을 가져옵니다. (개발 예정)
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-md border border-border text-text-muted bg-surface cursor-not-allowed opacity-60"
        >
          <Download className="w-4 h-4" />
          Figma에서 가져오기
        </button>

        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-md border border-border text-text-muted bg-surface cursor-not-allowed opacity-60"
        >
          <Download className="w-4 h-4" />
          Pencil에서 가져오기
        </button>
      </div>
    </div>
  );
}
