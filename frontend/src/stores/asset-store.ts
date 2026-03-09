import { create } from "zustand";

interface DesignTokenSet {
  readonly id: string;
  readonly name: string;
  readonly tokens: Record<string, unknown>;
}

interface WidgetTemplate {
  readonly id: string;
  readonly name: string;
  readonly category: string | null;
  readonly template: Record<string, unknown>;
}

interface AssetFile {
  readonly id: string;
  readonly name: string;
  readonly filePath: string;
}

type AssetTab = "tokens" | "icons" | "images" | "templates" | "sync";

interface AssetState {
  readonly designTokenSets: readonly DesignTokenSet[];
  readonly templates: readonly WidgetTemplate[];
  readonly icons: readonly AssetFile[];
  readonly images: readonly AssetFile[];

  readonly activeTab: AssetTab;
  readonly setActiveTab: (tab: AssetTab) => void;

  readonly loadTokens: () => Promise<void>;
  readonly loadTemplates: () => Promise<void>;
  readonly loadAssets: () => Promise<void>;
  readonly reset: () => void;
}

const BASE = "/api";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

const initialState = {
  designTokenSets: [] as readonly DesignTokenSet[],
  templates: [] as readonly WidgetTemplate[],
  icons: [] as readonly AssetFile[],
  images: [] as readonly AssetFile[],
  activeTab: "tokens" as AssetTab,
};

export const useAssetStore = create<AssetState>()((set) => ({
  ...initialState,

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  loadTokens: async () => {
    const data = await request<DesignTokenSet[]>("/assets/tokens");
    set({ designTokenSets: data });
  },

  loadTemplates: async () => {
    const data = await request<WidgetTemplate[]>("/assets/templates");
    set({ templates: data });
  },

  loadAssets: async () => {
    const data = await request<{ icons: AssetFile[]; images: AssetFile[] }>(
      "/assets/files",
    );
    set({ icons: data.icons, images: data.images });
  },

  reset: () => {
    set({ ...initialState });
  },
}));
