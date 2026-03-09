export type ComponentType =
  | "card"
  | "text"
  | "button"
  | "text-field"
  | "select"
  | "checkbox"
  | "image"
  | "icon"
  | "divider"
  | "container"
  | "grid"
  | "stack";

export interface A2UIComponent {
  readonly id: string;
  readonly type: ComponentType;
  readonly children?: readonly string[];
  readonly props?: Readonly<Record<string, unknown>>;
  readonly style?: Readonly<Record<string, string>>;
}

export interface DesignTokens {
  readonly colors?: Readonly<Record<string, string>>;
  readonly spacing?: Readonly<Record<string, string>>;
  readonly typography?: Readonly<
    Record<
      string,
      {
        readonly fontFamily?: string;
        readonly fontSize?: string;
        readonly fontWeight?: string | number;
        readonly lineHeight?: string;
      }
    >
  >;
  readonly borderRadius?: Readonly<Record<string, string>>;
}

export interface A2UIDocument {
  readonly version: string;
  readonly designTokens?: DesignTokens;
  readonly components: readonly A2UIComponent[];
}

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly document: A2UIDocument;
  readonly created_at: string;
  readonly updated_at: string;
}
