import type {
  ComponentPropsWithoutRef,
  ComponentRef,
  ForwardedRef,
  ReactElement,
  ReactNode,
} from "react";
import { forwardRef } from "react";
import clsx from "clsx";
import styles from "./Text.module.css";

const css = styles as Record<string, string>;

export type TextElement =
  | "p"
  | "span"
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "label"
  | "strong";

export type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "p"
  | "p-sm"
  | "label"
  | "caption"
  | "overline";

const ELEMENT_CLASS_MAP: Record<TextElement, string> = {
  p: css["default-p"] ?? "default-p",
  span: css["default-span"] ?? "default-span",
  div: css["default-div"] ?? "default-div",
  h1: css["default-h1"] ?? "default-h1",
  h2: css["default-h2"] ?? "default-h2",
  h3: css["default-h3"] ?? "default-h3",
  h4: css["default-h4"] ?? "default-h4",
  label: css["default-label"] ?? "default-label",
  strong: css["default-strong"] ?? "default-strong",
};

const VARIANT_CLASS_MAP: Record<TextVariant, string> = {
  display: css["variant-display"] ?? "variant-display",
  h1: css["variant-h1"] ?? "variant-h1",
  h2: css["variant-h2"] ?? "variant-h2",
  h3: css["variant-h3"] ?? "variant-h3",
  h4: css["variant-h4"] ?? "variant-h4",
  p: css["variant-p"] ?? "variant-p",
  "p-sm": css["variant-p-sm"] ?? "variant-p-sm",
  label: css["variant-label"] ?? "variant-label",
  caption: css["variant-caption"] ?? "variant-caption",
  overline: css["variant-overline"] ?? "variant-overline",
};

export type TextProps<T extends TextElement = "p"> = {
  as?: T;
  variant?: TextVariant;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "variant" | "className">;

type TextComponent = <T extends TextElement = "p">(
  props: TextProps<T> & { ref?: ForwardedRef<ComponentRef<T>> },
) => ReactElement | null;

export const Text = forwardRef(function Text<T extends TextElement = "p">(
  { as, variant, className, children, ...props }: TextProps<T>,
  ref: ForwardedRef<ComponentRef<T>>,
) {
  const Component = as ?? "p";
  const resolvedClassName = clsx(
    ELEMENT_CLASS_MAP[Component],
    variant ? VARIANT_CLASS_MAP[variant] : undefined,
    className,
  );

  const Tag = Component as any;

  return (
    <Tag
      {...(props as Record<string, unknown>)}
      className={resolvedClassName || undefined}
      ref={ref as any}
    >
      {children}
    </Tag>
  );
}) as TextComponent;
