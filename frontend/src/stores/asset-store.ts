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

type AssetTab =
  | "widgets"
  | "tokens"
  | "icons"
  | "images"
  | "templates"
  | "sync";

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

const DEFAULT_TOKEN_SETS: readonly DesignTokenSet[] = [
  {
    id: "colors",
    name: "Colors",
    tokens: {
      "colors.primary": "#3B82F6",
      "colors.primary-light": "#60A5FA",
      "colors.primary-dark": "#2563EB",
      "colors.secondary": "#8B5CF6",
      "colors.secondary-light": "#A78BFA",
      "colors.secondary-dark": "#7C3AED",
      "colors.success": "#22C55E",
      "colors.warning": "#F59E0B",
      "colors.error": "#EF4444",
      "colors.info": "#06B6D4",
      "colors.background": "#FFFFFF",
      "colors.surface": "#F8FAFC",
      "colors.surface-elevated": "#F1F5F9",
      "colors.text-primary": "#0F172A",
      "colors.text-secondary": "#475569",
      "colors.text-muted": "#94A3B8",
      "colors.border": "#E2E8F0",
      "colors.divider": "#CBD5E1",
    },
  },
  {
    id: "spacing",
    name: "Spacing",
    tokens: {
      "spacing.xs": "4px",
      "spacing.sm": "8px",
      "spacing.md": "16px",
      "spacing.lg": "24px",
      "spacing.xl": "32px",
      "spacing.2xl": "48px",
      "spacing.3xl": "64px",
    },
  },
  {
    id: "typography",
    name: "Typography",
    tokens: {
      "typography.h1.fontSize": "36px",
      "typography.h1.fontWeight": "700",
      "typography.h1.lineHeight": "1.2",
      "typography.h2.fontSize": "30px",
      "typography.h2.fontWeight": "600",
      "typography.h2.lineHeight": "1.3",
      "typography.h3.fontSize": "24px",
      "typography.h3.fontWeight": "600",
      "typography.h3.lineHeight": "1.4",
      "typography.body.fontSize": "16px",
      "typography.body.fontWeight": "400",
      "typography.body.lineHeight": "1.6",
      "typography.caption.fontSize": "12px",
      "typography.caption.fontWeight": "400",
      "typography.caption.lineHeight": "1.5",
      "typography.fontFamily.sans": "Plus Jakarta Sans, sans-serif",
      "typography.fontFamily.mono": "JetBrains Mono, monospace",
    },
  },
  {
    id: "border-radius",
    name: "Border Radius",
    tokens: {
      "borderRadius.none": "0px",
      "borderRadius.sm": "4px",
      "borderRadius.md": "8px",
      "borderRadius.lg": "12px",
      "borderRadius.xl": "16px",
      "borderRadius.full": "9999px",
    },
  },
  {
    id: "shadows",
    name: "Shadows",
    tokens: {
      "shadow.sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "shadow.md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "shadow.lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      "shadow.xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    },
  },
];

const initialState = {
  designTokenSets: DEFAULT_TOKEN_SETS,
  templates: [] as readonly WidgetTemplate[],
  icons: [] as readonly AssetFile[],
  images: [] as readonly AssetFile[],
  activeTab: "widgets" as AssetTab,
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
