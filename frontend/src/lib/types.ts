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

export type WorkflowTrigger =
  | "onClick"
  | "onChange"
  | "onSubmit"
  | "onBlur"
  | "onFocus";

export type WorkflowActionType =
  | "api"
  | "navigate"
  | "setState"
  | "submitForm"
  | "custom";

export interface WorkflowAction {
  readonly id: string;
  readonly type: WorkflowActionType;
  readonly label?: string;
  // api
  readonly method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  readonly url?: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly body?: string;
  // navigate
  readonly path?: string;
  // setState
  readonly target?: string;
  readonly value?: string;
  // submitForm
  readonly formId?: string;
  // custom
  readonly description?: string;
  // chaining
  readonly onSuccess?: string;
  readonly onError?: string;
}

export interface Workflow {
  readonly trigger: WorkflowTrigger;
  readonly actions: readonly WorkflowAction[];
}

export const INTERACTIVE_TYPES: readonly ComponentType[] = [
  "button",
  "text-field",
  "select",
  "checkbox",
];

export const TRIGGER_OPTIONS: Record<ComponentType, readonly WorkflowTrigger[]> = {
  button: ["onClick"],
  "text-field": ["onChange", "onBlur", "onFocus"],
  select: ["onChange"],
  checkbox: ["onChange"],
  card: [],
  text: [],
  image: [],
  icon: [],
  divider: [],
  container: [],
  grid: [],
  stack: [],
};

export interface A2UIComponent {
  readonly id: string;
  readonly type: ComponentType;
  readonly children?: readonly string[];
  readonly props?: Readonly<Record<string, unknown>>;
  readonly style?: Readonly<Record<string, string>>;
  readonly workflows?: readonly Workflow[];
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
