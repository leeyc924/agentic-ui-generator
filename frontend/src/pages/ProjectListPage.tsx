import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Clock,
} from "lucide-react";
import { api } from "../lib/api";
import type { Project } from "../lib/types";

export function ProjectListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<readonly Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const data = await api.projects.list();
      setProjects(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "프로젝트 목록을 불러올 수 없습니다",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    try {
      const project = await api.projects.create(trimmed, {
        version: "1.0",
        components: [],
      });
      setNewName("");
      setCreating(false);
      navigate(`/preview/${project.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "프로젝트 생성 실패");
    }
  };

  const handleRename = async (id: string) => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    try {
      await api.projects.update(id, { name: trimmed });
      setEditingId(null);
      setEditName("");
      fetchProjects();
    } catch (e) {
      setError(e instanceof Error ? e.message : "이름 변경 실패");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.projects.delete(id);
      setDeletingId(null);
      fetchProjects();
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제 실패");
    }
  };

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="h-12 bg-surface border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">홈</span>
        </Link>

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-accent" />
          <h1 className="text-lg font-semibold text-text-primary">
            프로젝트 관리
          </h1>
        </div>

        <div className="mr-auto" />

        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent text-white text-sm hover:bg-accent/90 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>새 프로젝트</span>
        </button>
      </header>

      <main className="flex-1 overflow-auto p-6">
        {error && (
          <div className="mb-4 p-3 rounded bg-error/10 border border-error/30 text-error text-sm">
            {error}
          </div>
        )}

        {creating && (
          <div className="mb-6 p-4 rounded-lg bg-surface border border-border">
            <h3 className="text-sm font-medium text-text-primary mb-3">
              새 프로젝트 생성
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setCreating(false);
                    setNewName("");
                  }
                }}
                placeholder="프로젝트 이름"
                autoFocus
                className="flex-1 px-3 py-1.5 rounded border border-border bg-bg text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-4 py-1.5 rounded bg-accent text-white text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                생성
              </button>
              <button
                onClick={() => {
                  setCreating(false);
                  setNewName("");
                }}
                className="px-4 py-1.5 rounded border border-border text-text-muted text-sm hover:bg-surface-elevated cursor-pointer transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-text-muted">
            로딩 중...
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-3">
            <FolderOpen className="w-12 h-12 opacity-30" />
            <p>프로젝트가 없습니다</p>
            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-accent text-white text-sm hover:bg-accent/90 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>첫 프로젝트 만들기</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg bg-surface border border-border hover:border-accent/50 transition-colors group"
              >
                <div className="p-4">
                  {editingId === project.id ? (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(project.id);
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setEditName("");
                          }
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 rounded border border-border bg-bg text-text-primary text-sm focus:outline-none focus:border-accent"
                      />
                      <button
                        onClick={() => handleRename(project.id)}
                        disabled={!editName.trim()}
                        className="px-2 py-1 rounded bg-accent text-white text-xs hover:bg-accent/90 disabled:opacity-50 cursor-pointer transition-colors"
                      >
                        저장
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-sm font-medium text-text-primary mb-1 truncate">
                      {project.name}
                    </h3>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(project.updated_at)}</span>
                  </div>

                  <div className="text-xs text-text-muted">
                    위젯 {project.document.components.length}개
                  </div>
                </div>

                {deletingId === project.id ? (
                  <div className="border-t border-border p-3 bg-error/5">
                    <p className="text-xs text-error mb-2">
                      정말 삭제하시겠습니까?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex-1 px-2 py-1 rounded bg-error text-white text-xs hover:bg-error/90 cursor-pointer transition-colors"
                      >
                        삭제
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="flex-1 px-2 py-1 rounded border border-border text-text-muted text-xs hover:bg-surface-elevated cursor-pointer transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-border p-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/preview/${project.id}`}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-text-muted hover:text-accent hover:bg-surface-elevated cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>열기</span>
                    </Link>
                    <button
                      onClick={() => startEditing(project)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-text-muted hover:text-accent hover:bg-surface-elevated cursor-pointer transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>이름변경</span>
                    </button>
                    <button
                      onClick={() => setDeletingId(project.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-text-muted hover:text-error hover:bg-error/10 cursor-pointer transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>삭제</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
