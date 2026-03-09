import type { A2UIDocument, A2UIComponent, DesignTokens } from "./types";

function resolveToken(value: string, tokens?: DesignTokens): string {
  if (!tokens || !value.startsWith("$")) return value;
  const path = value.slice(1).split(".");
  let current: unknown = tokens;
  for (const key of path) {
    if (current == null || typeof current !== "object") return value;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : value;
}

function styleToTailwind(
  style: Readonly<Record<string, string>> | undefined,
  tokens?: DesignTokens,
): string {
  if (!style) return "";
  const resolved = Object.fromEntries(
    Object.entries(style).map(([k, v]) => [k, resolveToken(v, tokens)]),
  );
  const classes: string[] = [];

  for (const [key, value] of Object.entries(resolved)) {
    switch (key) {
      case "padding":
        classes.push(`p-[${value}]`);
        break;
      case "paddingTop":
        classes.push(`pt-[${value}]`);
        break;
      case "paddingBottom":
        classes.push(`pb-[${value}]`);
        break;
      case "paddingLeft":
        classes.push(`pl-[${value}]`);
        break;
      case "paddingRight":
        classes.push(`pr-[${value}]`);
        break;
      case "margin":
        classes.push(`m-[${value}]`);
        break;
      case "marginTop":
        classes.push(`mt-[${value}]`);
        break;
      case "marginBottom":
        classes.push(`mb-[${value}]`);
        break;
      case "backgroundColor":
        classes.push(`bg-[${value}]`);
        break;
      case "color":
        classes.push(`text-[${value}]`);
        break;
      case "fontSize":
        classes.push(`text-[${value}]`);
        break;
      case "fontWeight":
        classes.push(`font-[${value}]`);
        break;
      case "borderRadius":
        classes.push(`rounded-[${value}]`);
        break;
      case "border":
        classes.push(`border-[${value}]`);
        break;
      case "width":
        classes.push(`w-[${value}]`);
        break;
      case "height":
        classes.push(`h-[${value}]`);
        break;
      case "gap":
        classes.push(`gap-[${value}]`);
        break;
      case "display":
        if (value === "flex") classes.push("flex");
        if (value === "grid") classes.push("grid");
        break;
      case "flexDirection":
        if (value === "column") classes.push("flex-col");
        if (value === "row") classes.push("flex-row");
        break;
      case "alignItems":
        classes.push(`items-${value}`);
        break;
      case "justifyContent":
        classes.push(`justify-${value}`);
        break;
      default:
        // Inline style fallback
        break;
    }
  }

  return classes.join(" ");
}

function componentToJSX(
  component: A2UIComponent,
  allComponents: readonly A2UIComponent[],
  tokens?: DesignTokens,
  indent: number = 2,
): string {
  const pad = " ".repeat(indent);
  const tw = styleToTailwind(component.style, tokens);
  const cls = tw ? ` className="${tw}"` : "";

  const childComponents = (component.children ?? [])
    .map((childId) => allComponents.find((c) => c.id === childId))
    .filter(Boolean) as A2UIComponent[];

  const childrenJSX = childComponents
    .map((child) => componentToJSX(child, allComponents, tokens, indent + 2))
    .join("\n");

  switch (component.type) {
    case "text": {
      const content = (component.props?.content as string) ?? "";
      const variant = component.props?.variant as string | undefined;
      const Tag = variant === "heading" ? "h2" : variant === "subheading" ? "h3" : "p";
      return `${pad}<${Tag}${cls}>${content}</${Tag}>`;
    }

    case "button": {
      const label = (component.props?.label as string) ?? "Button";
      return `${pad}<button${cls}>${label}</button>`;
    }

    case "text-field": {
      const placeholder = (component.props?.placeholder as string) ?? "";
      const label = component.props?.label as string | undefined;
      const lines = [];
      if (label) {
        lines.push(`${pad}<div>`);
        lines.push(`${pad}  <label className="block text-sm font-medium mb-1">${label}</label>`);
        lines.push(`${pad}  <input type="text" placeholder="${placeholder}"${cls} />`);
        lines.push(`${pad}</div>`);
      } else {
        lines.push(`${pad}<input type="text" placeholder="${placeholder}"${cls} />`);
      }
      return lines.join("\n");
    }

    case "select": {
      const options = (component.props?.options as string[]) ?? [];
      const label = component.props?.label as string | undefined;
      const lines = [];
      if (label) lines.push(`${pad}<div>`);
      if (label) lines.push(`${pad}  <label className="block text-sm font-medium mb-1">${label}</label>`);
      const selectPad = label ? `${pad}  ` : pad;
      lines.push(`${selectPad}<select${cls}>`);
      for (const opt of options) {
        lines.push(`${selectPad}  <option value="${opt}">${opt}</option>`);
      }
      lines.push(`${selectPad}</select>`);
      if (label) lines.push(`${pad}</div>`);
      return lines.join("\n");
    }

    case "checkbox": {
      const label = (component.props?.label as string) ?? "";
      return `${pad}<label${cls}>\n${pad}  <input type="checkbox" />\n${pad}  <span className="ml-2">${label}</span>\n${pad}</label>`;
    }

    case "image": {
      const src = (component.props?.src as string) ?? "";
      const alt = (component.props?.alt as string) ?? "";
      return `${pad}<img src="${src}" alt="${alt}"${cls} />`;
    }

    case "icon": {
      const name = (component.props?.name as string) ?? "circle";
      return `${pad}<span${cls}>{/* icon: ${name} */}</span>`;
    }

    case "divider":
      return `${pad}<hr${cls} />`;

    case "card":
      return childrenJSX
        ? `${pad}<div${cls}>\n${childrenJSX}\n${pad}</div>`
        : `${pad}<div${cls} />`;

    case "container":
      return childrenJSX
        ? `${pad}<div${cls}>\n${childrenJSX}\n${pad}</div>`
        : `${pad}<div${cls} />`;

    case "grid": {
      const cols = component.props?.columns as number | undefined;
      const gridCls = tw ? `grid grid-cols-${cols ?? 2} ${tw}` : `grid grid-cols-${cols ?? 2}`;
      return childrenJSX
        ? `${pad}<div className="${gridCls}">\n${childrenJSX}\n${pad}</div>`
        : `${pad}<div className="${gridCls}" />`;
    }

    case "stack": {
      const dir = (component.props?.direction as string) ?? "vertical";
      const stackCls = dir === "horizontal" ? `flex flex-row ${tw}` : `flex flex-col ${tw}`;
      return childrenJSX
        ? `${pad}<div className="${stackCls.trim()}">\n${childrenJSX}\n${pad}</div>`
        : `${pad}<div className="${stackCls.trim()}" />`;
    }

    default:
      return `${pad}<div${cls}>{/* ${component.type} */}</div>`;
  }
}

export function generateReactCode(document: A2UIDocument): string {
  const rootComponents = findRootComponents(document.components);
  const tokens = document.designTokens;

  const jsx = rootComponents
    .map((c) => componentToJSX(c, document.components, tokens, 6))
    .join("\n");

  return `export default function GeneratedUI() {
  return (
    <div className="p-4">
${jsx}
    </div>
  );
}
`;
}

function findRootComponents(
  components: readonly A2UIComponent[],
): A2UIComponent[] {
  const childIds = new Set(
    components.flatMap((c) => c.children ?? []),
  );
  return components.filter((c) => !childIds.has(c.id));
}
