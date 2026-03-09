import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { useEditorStore } from "../../../stores/editor-store";
import { generateReactCode } from "../../../lib/code-generator";

export function CodePanel() {
  const document = useEditorStore((s) => s.document);
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    if (!document) return "// 문서가 없습니다";
    return generateReactCode(document);
  }, [document]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
        <span className="text-xs text-text-muted">React + TailwindCSS</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-surface-elevated text-text-muted hover:text-text-primary transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "복사됨" : "복사"}
        </button>
      </div>
      <pre className="flex-1 overflow-auto p-3 text-xs font-mono text-text-secondary leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
