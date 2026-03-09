import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PreviewPage } from "../PreviewPage";
import type { Project } from "../../lib/types";

vi.mock("../../lib/api", () => ({
  api: {
    projects: {
      get: vi.fn(),
    },
  },
}));

// Must import after mock declaration
import { api } from "../../lib/api";

const MOCK_PROJECT: Project = {
  id: "test-1",
  name: "테스트 프로젝트",
  document: {
    version: "1.0",
    components: [
      { id: "c1", type: "text", props: { content: "Hello Preview" } },
    ],
  },
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function renderWithRouter(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/preview/${id}`]}>
      <Routes>
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PreviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    vi.mocked(api.projects.get).mockReturnValue(new Promise(() => {}));

    renderWithRouter("test-1");

    expect(screen.getByText("로딩 중...")).toBeInTheDocument();
  });

  it("renders project content after fetch", async () => {
    vi.mocked(api.projects.get).mockResolvedValue(MOCK_PROJECT);

    renderWithRouter("test-1");

    await waitFor(() => {
      expect(screen.getByText("테스트 프로젝트")).toBeInTheDocument();
    });

    expect(screen.getByText("미리보기")).toBeInTheDocument();
    expect(api.projects.get).toHaveBeenCalledWith("test-1");
  });

  it("shows error state on fetch failure", async () => {
    vi.mocked(api.projects.get).mockRejectedValue(
      new Error("API Error: 500 Internal Server Error"),
    );

    renderWithRouter("test-1");

    await waitFor(() => {
      expect(
        screen.getByText("API Error: 500 Internal Server Error"),
      ).toBeInTheDocument();
    });
  });

  it("shows not found for missing project", async () => {
    vi.mocked(api.projects.get).mockResolvedValue(
      null as unknown as Project,
    );

    renderWithRouter("nonexistent");

    await waitFor(() => {
      expect(
        screen.getByText("프로젝트를 찾을 수 없습니다"),
      ).toBeInTheDocument();
    });
  });
});
