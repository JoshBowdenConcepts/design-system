import type { FC, HTMLAttributes } from "react";
import { PlaceholderIcon } from "@design-system/icons";

/**
 * Placeholder component — NOT a real component.
 *
 * Exists only to prove the consumption chain: it pulls a value from
 * `@design-system/tokens` (via the `--ds-placeholder` custom property) and a
 * component from `@design-system/icons`. No hardcoded design values.
 * Delete when the first real component lands.
 */
export const Placeholder: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  return (
    <div
      {...props}
      data-ds-placeholder=""
      style={{ padding: "var(--ds-placeholder)", ...props.style }}
    >
      <PlaceholderIcon aria-hidden />
    </div>
  );
};
