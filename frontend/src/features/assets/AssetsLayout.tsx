import {
  Palette,
  Shapes,
  ImageIcon,
  LayoutTemplate,
  RefreshCw,
  LayoutGrid,
} from "lucide-react";
import { useAssetStore } from "../../stores/asset-store";
import { DesignTokenEditor } from "./DesignTokenEditor";
import { IconGallery } from "./IconGallery";
import { ImageGallery } from "./ImageGallery";
import { WidgetTemplateList } from "./WidgetTemplateList";
import { WidgetCatalog } from "./WidgetCatalog";
import { SyncAgentPanel } from "./SyncAgentPanel";

type TabKey = "widgets" | "tokens" | "icons" | "images" | "templates" | "sync";

const TABS: readonly {
  readonly key: TabKey;
  readonly label: string;
  readonly icon: React.ComponentType<{ readonly className?: string }>;
}[] = [
  { key: "widgets", label: "Widgets", icon: LayoutGrid },
  { key: "tokens", label: "Tokens", icon: Palette },
  { key: "icons", label: "Icons", icon: Shapes },
  { key: "images", label: "Images", icon: ImageIcon },
  { key: "templates", label: "Templates", icon: LayoutTemplate },
  { key: "sync", label: "Sync", icon: RefreshCw },
] as const;

const TAB_CONTENT: Record<TabKey, () => JSX.Element> = {
  widgets: () => <WidgetCatalog />,
  tokens: () => <DesignTokenEditor />,
  icons: () => <IconGallery />,
  images: () => <ImageGallery />,
  templates: () => <WidgetTemplateList />,
  sync: () => <SyncAgentPanel />,
};

export function AssetsLayout() {
  const activeTab = useAssetStore((s) => s.activeTab);
  const setActiveTab = useAssetStore((s) => s.setActiveTab);

  const ActiveContent = TAB_CONTENT[activeTab];

  return (
    <div className="flex flex-col h-full bg-bg">
      <div
        className="flex border-b border-border bg-surface"
        role="tablist"
        aria-label="Asset tabs"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                activeTab === tab.key
                  ? "text-accent border-b-2 border-accent"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto">
        <ActiveContent />
      </div>
    </div>
  );
}
