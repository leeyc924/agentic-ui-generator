import type { ComponentType } from "react";
import type { ComponentType as WidgetType } from "../../../lib/types";
import type { WidgetProps } from "./types";
import { CardWidget } from "./CardWidget";
import { TextWidget } from "./TextWidget";
import { ButtonWidget } from "./ButtonWidget";
import { TextFieldWidget } from "./TextFieldWidget";
import { SelectWidget } from "./SelectWidget";
import { CheckboxWidget } from "./CheckboxWidget";
import { ImageWidget } from "./ImageWidget";
import { IconWidget } from "./IconWidget";
import { DividerWidget } from "./DividerWidget";
import { ContainerWidget } from "./ContainerWidget";
import { GridWidget } from "./GridWidget";
import { StackWidget } from "./StackWidget";

export type { WidgetProps } from "./types";

export const WIDGET_MAP: Record<WidgetType, ComponentType<WidgetProps>> = {
  card: CardWidget,
  text: TextWidget,
  button: ButtonWidget,
  "text-field": TextFieldWidget,
  select: SelectWidget,
  checkbox: CheckboxWidget,
  image: ImageWidget,
  icon: IconWidget,
  divider: DividerWidget,
  container: ContainerWidget,
  grid: GridWidget,
  stack: StackWidget,
};
