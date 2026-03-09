import type { ReactNode } from "react";

export interface WidgetProps {
  readonly id: string;
  readonly props?: Readonly<Record<string, unknown>>;
  readonly style?: Record<string, string>;
  readonly selected?: boolean;
  readonly onClick?: () => void;
  readonly children?: ReactNode;
}
