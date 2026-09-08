/**
 * Custom TypeScript token schema (not DTCG / Style Dictionary).
 *
 * A token has a required base `value` plus an optional recursive `overrides`
 * tree. Override keys are axis-marked and may nest in any order, to any depth:
 *   - bare `light` / `dark`       -> colour-mode axis
 *   - `<number>$` (e.g. `768$`)   -> min-width breakpoint axis (px)
 *   - `.<name>` (e.g. `.compact`) -> class-name scope axis, emitted as `.ds-scope-<name>`
 *
 * `resolve.ts` flattens the tree into `ResolvedRule[]`; `generate.ts` projects
 * those into scoped CSS blocks (`:root`, `@media`, `[data-theme="dark"]`,
 * `.ds-scope-*`) in ascending order of specificity, plus a typed JS object and
 * Swift constants.
 */

export type TokenValue = string | number;

export type ColorMode = "light" | "dark";

/**
 * A node in a token's `overrides` tree. Either a bare leaf value (shorthand for
 * `{ value: <leaf> }`) or an object whose optional `value` is the value for the
 * condition-set accumulated on the path to this node, and whose other keys are
 * axis markers that each add one condition and recurse.
 */
export type OverrideNode = TokenValue | OverrideObject;

export interface OverrideObject {
  value?: TokenValue;
  [axisKey: string]: OverrideNode | undefined;
}

export interface Token {
  /** Base value — emitted in `:root`. Required. */
  value: TokenValue;
  /** Optional human description, rendered as a comment in generated output. */
  description?: string;
  /** Recursive, order-independent conditional overrides. */
  overrides?: Record<string, OverrideNode>;
}

export type Tokens = Record<string, Token>;

/** The unordered set of conditions accumulated along one override path. */
export interface ConditionSet {
  colorMode?: ColorMode;
  /** min-width in px. */
  minWidth?: number;
  /** class-name scope, without the leading dot. */
  scope?: string;
}

/** One flattened (condition-set -> value) rule for a single token. */
export interface ResolvedRule {
  /** Namespaced token name, e.g. `type.body`. */
  name: string;
  conditions: ConditionSet;
  value: TokenValue;
  /** Specificity weight, 0..7 — derived from `conditions` (see `resolve.ts`). */
  specificity: number;
}
