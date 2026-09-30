import type { ComponentPropsWithoutRef, ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";
import clsx from "clsx";
import { Text } from "./Text.js";
import styles from "./Button.module.css";

const css = styles as Record<string, string>;

export type ButtonVariant = "solid" | "outline" | "text";
export type ButtonSize = "sm" | "md";
export type ButtonContentAlignment = "center" | "space-between";

type ButtonSharedProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "type"
> & {
  /** solid = primary action, outline = secondary, text = tertiary/inline. Defaults to `solid`. */
  variant?: ButtonVariant;
  /** sm = 30px tall, md = 38px tall. Icon-only content uses these same sizes. Defaults to `md`. */
  size?: ButtonSize;
  /** Fills the available width and centers content. Defaults to `false`. */
  fullWidth?: boolean;
  /** Only meaningful when `fullWidth` is true. Defaults to `center`. */
  contentAlignment?: ButtonContentAlignment;
  /** Optional platform content before the label. */
  leadingIcon?: ReactNode;
  /** Optional platform content after the label. */
  trailingIcon?: ReactNode;
  /** Defaults to `button` so the control never submits a form implicitly. */
  type?: "button" | "submit" | "reset";
};

/**
 * A visible label makes `aria-label`/`aria-labelledby` optional; an icon-only
 * Button (no `children`) requires one, matching the platform's standard
 * accessible-name mechanism (FR-016).
 */
export type ButtonProps = ButtonSharedProps &
  (
    | { children: ReactNode; "aria-label"?: string; "aria-labelledby"?: string }
    | { children?: undefined; "aria-label": string; "aria-labelledby"?: never }
    | { children?: undefined; "aria-labelledby": string; "aria-label"?: never }
  );

export const Button = forwardRef(function Button(
  {
    variant = "solid",
    size = "md",
    fullWidth = false,
    contentAlignment = "center",
    leadingIcon,
    trailingIcon,
    type = "button",
    className,
    children,
    ...rest
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const props = rest as Record<string, unknown>;

  if (process.env.NODE_ENV !== "production" && !children) {
    const hasAccessibleName = Boolean(
      props["aria-label"] ?? props["aria-labelledby"],
    );
    if (!hasAccessibleName) {
      console.error(
        "Button: an icon-only Button (no visible label) requires a non-empty `aria-label` or `aria-labelledby`.",
      );
    }
  }

  const isIconOnly = !children;

  const resolvedClassName = clsx(
    css.button,
    css[`variant-${variant}`],
    css[`size-${size}`],
    isIconOnly && css["icon-only"],
    fullWidth && css["full-width"],
    fullWidth && css[`align-${contentAlignment}`],
    className,
  );

  return (
    <button
      {...(rest as ComponentPropsWithoutRef<"button">)}
      ref={ref}
      type={type}
      className={resolvedClassName}
    >
      {leadingIcon ? (
        <span className={css["icon-leading"]}>{leadingIcon}</span>
      ) : null}
      {children ? (
        <Text as="span" variant="label">
          {children}
        </Text>
      ) : null}
      {trailingIcon ? (
        <span className={css["icon-trailing"]}>{trailingIcon}</span>
      ) : null}
    </button>
  );
});
