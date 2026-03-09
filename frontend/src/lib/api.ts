import type { A2UIDocument, Project } from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  projects: {
    list: () => request<Project[]>("/projects"),

    get: (id: string) => request<Project>(`/projects/${id}`),

    create: (name: string, document: A2UIDocument) =>
      request<Project>("/projects", {
        method: "POST",
        body: JSON.stringify({ name, document }),
      }),

    update: (id: string, data: { name?: string; document?: A2UIDocument }) =>
      request<Project>(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<void>(`/projects/${id}`, { method: "DELETE" }),
  },

  generate: (
    prompt: string,
    selectedWidgetId?: string,
    currentDocument?: A2UIDocument,
  ) => {
    return fetch(`${BASE}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        selected_widget_id: selectedWidgetId,
        current_document: currentDocument,
      }),
    });
  },
} as const;
