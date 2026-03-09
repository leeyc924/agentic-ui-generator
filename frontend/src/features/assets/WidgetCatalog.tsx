import { useState } from "react";
import {
  LayoutGrid,
  Type,
  Square,
  TextCursorInput,
  ChevronDown,
  ImageIcon,
  CircleDot,
  Minus,
  Columns3,
  Rows3,
  Layers,
  ListFilter,
  Search,
} from "lucide-react";
import type { ComponentType } from "../../lib/types";

interface WidgetInfo {
  readonly type: ComponentType;
  readonly label: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ readonly className?: string }>;
  readonly category: "layout" | "input" | "display";
}

const WIDGETS: readonly WidgetInfo[] = [
  {
    type: "container",
    label: "Container",
    description: "다른 위젯을 감싸는 컨테이너",
    icon: Square,
    category: "layout",
  },
  {
    type: "grid",
    label: "Grid",
    description: "그리드 레이아웃 컨테이너",
    icon: LayoutGrid,
    category: "layout",
  },
  {
    type: "stack",
    label: "Stack",
    description: "수직/수평 스택 레이아웃",
    icon: Layers,
    category: "layout",
  },
  {
    type: "card",
    label: "Card",
    description: "콘텐츠를 담는 카드 위젯",
    icon: Columns3,
    category: "layout",
  },
  {
    type: "divider",
    label: "Divider",
    description: "영역 구분선",
    icon: Minus,
    category: "layout",
  },
  {
    type: "text",
    label: "Text",
    description: "텍스트 표시 위젯",
    icon: Type,
    category: "display",
  },
  {
    type: "image",
    label: "Image",
    description: "이미지 표시 위젯",
    icon: ImageIcon,
    category: "display",
  },
  {
    type: "icon",
    label: "Icon",
    description: "아이콘 표시 위젯",
    icon: CircleDot,
    category: "display",
  },
  {
    type: "button",
    label: "Button",
    description: "클릭 가능한 버튼",
    icon: Rows3,
    category: "input",
  },
  {
    type: "text-field",
    label: "Text Field",
    description: "텍스트 입력 필드",
    icon: TextCursorInput,
    category: "input",
  },
  {
    type: "select",
    label: "Select",
    description: "드롭다운 선택 위젯",
    icon: ChevronDown,
    category: "input",
  },
  {
    type: "checkbox",
    label: "Checkbox",
    description: "체크박스 위젯",
    icon: CircleDot,
    category: "input",
  },
] as const;

type CategoryFilter = "all" | "layout" | "input" | "display";

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "전체",
  layout: "레이아웃",
  input: "입력",
  display: "표시",
};

export function WidgetCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filtered = WIDGETS.filter((w) => {
    const matchesCategory = category === "all" || w.category === category;
    const matchesSearch =
      search === "" ||
      w.label.toLowerCase().includes(search.toLowerCase()) ||
      w.description.includes(search);
    return matchesCategory && matchesSearch;
  });

  return (
    <div data-testid="widget-catalog" className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <LayoutGrid className="w-5 h-5" />
          Widgets
        </h2>
        <span className="text-xs text-text-muted">
          {filtered.length}개 위젯
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="위젯 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md bg-surface border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex items-center gap-1">
          <ListFilter className="w-4 h-4 text-text-muted" />
          {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-2 py-1 text-xs rounded cursor-pointer transition-colors ${
                category === cat
                  ? "bg-accent text-white"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-elevated"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-8">
          검색 결과가 없습니다
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((widget) => {
            const Icon = widget.icon;
            return (
              <button
                key={widget.type}
                type="button"
                className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-surface hover:border-accent/50 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <Icon className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-text-primary block">
                    {widget.label}
                  </span>
                  <span className="text-xs text-text-muted leading-tight">
                    {widget.description}
                  </span>
                </div>
                <span
                  className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                    widget.category === "layout"
                      ? "bg-blue-500/10 text-blue-400"
                      : widget.category === "input"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {CATEGORY_LABELS[widget.category]}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
