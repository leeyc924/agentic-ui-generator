import { useAssetStore } from "../../stores/asset-store";
import { DesignTokenEditor } from "./DesignTokenEditor";
import { IconGallery } from "./IconGallery";
import { ImageGallery } from "./ImageGallery";
import { WidgetTemplateList } from "./WidgetTemplateList";
import { SyncAgentPanel } from "./SyncAgentPanel";

type TabKey = "tokens" | "icons" | "images" | "templates" | "sync";

const TABS: readonly { readonly key: TabKey; readonly label: string }[] = [
  { key: "tokens", label: "Tokens" },
  { key: "icons", label: "Icons" },
  { key: "images", label: "Images" },
  { key: "templates", label: "Templates" },
  { key: "sync", label: "Sync" },
] as const;

const TAB_CONTENT: Record<TabKey, () => JSX.Element> = {
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
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-accent border-b-2 border-accent"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <ActiveContent />
      </div>
    </div>
  );
}
