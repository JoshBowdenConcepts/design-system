import type { ComponentPropsWithoutRef, ForwardedRef, ReactNode } from "react";
import { forwardRef } from "react";
import clsx from "clsx";
import { Text } from "./Text.js";
import styles from "./Link.module.css";

const css = styles as Record<string, string>;

/**
 * Non-heading, non-display Text variants — the only sizes Link may use
 * (FR-006). Omitting `size` inherits the surrounding text's size, which is
 * `Text`'s own `as="span"` default behavior (`font: inherit`), not a value
 * this type needs to represent.
 */
export type LinkSize = "p" | "p-sm" | "label" | "caption";

type LinkSharedProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "href" | "target" | "rel" | "className" | "children"
> & {
  /** The link's destination. Omit it to render the unavailable presentation (FR-013) — there is no separate `disabled` prop. */
  href?: string;
  /** One of Text's non-heading variants. Omitted inherits the surrounding text's size (FR-004). Heading/display sizes are not members of this type (FR-006). */
  size?: LinkSize;
  /** Meets the 24×24 minimum interactive target. Defaults to `false` (inline), which is exempt from that minimum (FR-007). */
  standalone?: boolean;
  /** Shows a hidden-from-AT indicator, adds a new-context statement to the accessible name, and opens safely outside the current context (FR-011). Defaults to `false`. */
  external?: boolean;
  className?: string;
};

/**
 * Visible content provides the accessible name by default; content-less
 * (e.g. icon-only) usage requires a non-empty `aria-label` or
 * `aria-labelledby` instead (FR-014) — the same contract `ButtonProps`
 * enforces, so an empty accessible name is a type error rather than a
 * runtime warning.
 */
export type LinkProps = LinkSharedProps &
  (
    | { children: ReactNode; "aria-label"?: string; "aria-labelledby"?: string }
    | { children?: undefined; "aria-label": string; "aria-labelledby"?: never }
    | { children?: undefined; "aria-labelledby": string; "aria-label"?: never }
  );

export const Link = forwardRef(function Link(
  {
    href,
    size,
    standalone = false,
    external = false,
    className,
    children,
    ...rest
  }: LinkProps,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  // No destination: the unavailable presentation (FR-013/D7). Render plain,
  // de-emphasized text with no interactive attributes — never a disabled-
  // looking but still focusable/announced link.
  if (!href) {
    return (
      <Text
        as="span"
        variant={size}
        className={clsx(css.unavailable, className)}
      >
        {children}
      </Text>
    );
  }

  const resolvedClassName = clsx(
    css.link,
    standalone && css.standalone,
    className,
  );

  return (
    <a
      {...(rest as ComponentPropsWithoutRef<"a">)}
      ref={ref}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={resolvedClassName}
    >
      <Text as="span" variant={size}>
        {children}
      </Text>
      {external ? (
        <>
          <span aria-hidden="true" className={css["external-indicator"]}>
            ↗
          </span>
          <span className={css["visually-hidden"]}>(opens in a new tab)</span>
        </>
      ) : null}
    </a>
  );
});
