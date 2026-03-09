import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EditorPage } from "../pages/EditorPage";

describe("App", () => {
  it("renders A2UI header on editor page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <EditorPage />
      </MemoryRouter>,
    );
    const topBar = screen.getByTestId("top-bar");
    expect(topBar).toHaveTextContent("A2UI");
  });
});
