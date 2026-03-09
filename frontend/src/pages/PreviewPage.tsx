import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useEditorStore } from "../stores/editor-store";
import { EditorLayout } from "../features/editor";
import type { Project } from "../lib/types";

export function PreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadDocument = useEditorStore((s) => s.loadDocument);

  useEffect(() => {
    if (!id) return;
    api.projects
      .get(id)
      .then((project: Project) => {
        loadDocument(project.document);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, loadDocument]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-text-muted">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center text-error">
        {error}
      </div>
    );
  }

  return <EditorLayout />;
}
