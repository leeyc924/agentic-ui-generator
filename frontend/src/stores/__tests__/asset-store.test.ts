import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAssetStore } from "../asset-store";

describe("AssetStore", () => {
  beforeEach(() => {
    useAssetStore.getState().reset();
  });

  it("has empty arrays in initial state", () => {
    const state = useAssetStore.getState();
    expect(state.designTokenSets).toEqual([]);
    expect(state.templates).toEqual([]);
    expect(state.icons).toEqual([]);
    expect(state.images).toEqual([]);
  });

  it("has tokens as default active tab", () => {
    expect(useAssetStore.getState().activeTab).toBe("tokens");
  });

  it("setActiveTab changes tab", () => {
    useAssetStore.getState().setActiveTab("icons");
    expect(useAssetStore.getState().activeTab).toBe("icons");

    useAssetStore.getState().setActiveTab("sync");
    expect(useAssetStore.getState().activeTab).toBe("sync");
  });

  it("reset clears all data and resets tab", () => {
    useAssetStore.setState({
      designTokenSets: [{ id: "1", name: "test", tokens: { color: "#000" } }],
      templates: [{ id: "1", name: "tpl", category: "layout", template: {} }],
      icons: [{ id: "1", name: "icon", filePath: "/icons/a.svg" }],
      images: [{ id: "1", name: "img", filePath: "/images/a.png" }],
      activeTab: "sync",
    });

    useAssetStore.getState().reset();

    const state = useAssetStore.getState();
    expect(state.designTokenSets).toEqual([]);
    expect(state.templates).toEqual([]);
    expect(state.icons).toEqual([]);
    expect(state.images).toEqual([]);
    expect(state.activeTab).toBe("tokens");
  });

  it("loadTokens fetches and stores design token sets", async () => {
    const mockTokens = [
      { id: "t1", name: "Default", tokens: { primary: "#3B82F6" } },
    ];
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockTokens),
    });

    await useAssetStore.getState().loadTokens();
    expect(useAssetStore.getState().designTokenSets).toEqual(mockTokens);
  });

  it("loadTemplates fetches and stores templates", async () => {
    const mockTemplates = [
      { id: "tpl1", name: "Card", category: "layout", template: { type: "card" } },
    ];
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockTemplates),
    });

    await useAssetStore.getState().loadTemplates();
    expect(useAssetStore.getState().templates).toEqual(mockTemplates);
  });

  it("loadAssets fetches and stores icons and images", async () => {
    const mockAssets = {
      icons: [{ id: "i1", name: "arrow", filePath: "/icons/arrow.svg" }],
      images: [{ id: "img1", name: "hero", filePath: "/images/hero.png" }],
    };
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockAssets),
    });

    await useAssetStore.getState().loadAssets();
    expect(useAssetStore.getState().icons).toEqual(mockAssets.icons);
    expect(useAssetStore.getState().images).toEqual(mockAssets.images);
  });
});
