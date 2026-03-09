import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "../api";
import type { A2UIDocument, Project } from "../types";

const mockProject: Project = {
  id: "proj-1",
  name: "Test Project",
  document: {
    version: "0.1.0",
    components: [{ id: "btn-1", type: "button" }],
  },
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function createMockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 204 ? "No Content" : "OK",
    json: () => Promise.resolve(body),
    headers: new Headers(),
    redirected: false,
    type: "basic",
    url: "",
    clone: () => createMockResponse(body, status),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(JSON.stringify(body)),
    bytes: () => Promise.resolve(new Uint8Array()),
  } as Response;
}

describe("API Client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("projects.list", () => {
    it("calls GET /api/projects", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(createMockResponse([mockProject]));

      const result = await api.projects.list();

      expect(fetchSpy).toHaveBeenCalledWith("/api/projects", {
        headers: { "Content-Type": "application/json" },
      });
      expect(result).toEqual([mockProject]);
    });
  });

  describe("projects.get", () => {
    it("calls GET /api/projects/:id", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(createMockResponse(mockProject));

      const result = await api.projects.get("proj-1");

      expect(fetchSpy).toHaveBeenCalledWith("/api/projects/proj-1", {
        headers: { "Content-Type": "application/json" },
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe("projects.create", () => {
    it("calls POST /api/projects with correct body", async () => {
      const doc: A2UIDocument = {
        version: "0.1.0",
        components: [{ id: "btn-1", type: "button" }],
      };

      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(createMockResponse(mockProject));

      const result = await api.projects.create("Test Project", doc);

      expect(fetchSpy).toHaveBeenCalledWith("/api/projects", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ name: "Test Project", document: doc }),
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe("projects.update", () => {
    it("calls PUT /api/projects/:id with partial data", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(createMockResponse(mockProject));

      const result = await api.projects.update("proj-1", {
        name: "Updated Name",
      });

      expect(fetchSpy).toHaveBeenCalledWith("/api/projects/proj-1", {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ name: "Updated Name" }),
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe("projects.delete", () => {
    it("handles 204 No Content response", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(createMockResponse(null, 204));

      const result = await api.projects.delete("proj-1");

      expect(fetchSpy).toHaveBeenCalledWith("/api/projects/proj-1", {
        headers: { "Content-Type": "application/json" },
        method: "DELETE",
      });
      expect(result).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("throws on non-ok response", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as Response);

      await expect(api.projects.get("nonexistent")).rejects.toThrow(
        "API Error: 404 Not Found",
      );
    });

    it("throws on server error", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as Response);

      await expect(api.projects.list()).rejects.toThrow(
        "API Error: 500 Internal Server Error",
      );
    });
  });

  describe("generate", () => {
    it("sends correct body with all parameters", async () => {
      const doc: A2UIDocument = {
        version: "0.1.0",
        components: [],
      };

      const mockResponse = createMockResponse({ ok: true });
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(mockResponse);

      const result = await api.generate("Create a login form", "widget-1", doc);

      expect(fetchSpy).toHaveBeenCalledWith("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Create a login form",
          selected_widget_id: "widget-1",
          current_document: doc,
        }),
      });
      expect(result).toBe(mockResponse);
    });

    it("sends body with only prompt", async () => {
      const mockResponse = createMockResponse({ ok: true });
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(mockResponse);

      await api.generate("Create a button");

      expect(fetchSpy).toHaveBeenCalledWith("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Create a button",
          selected_widget_id: undefined,
          current_document: undefined,
        }),
      });
    });
  });
});
