/**
 * `@design-system/tokens` public entry point.
 *
 * Exposes the assembled token tree, the finalized (condition-set -> value)
 * rules, and the schema types. The generated web CSS
 * (`@design-system/tokens/tokens.css`) and iOS Swift sources are projections of
 * this same source.
 *
 * The private colour palette (`./palette.ts`) is intentionally NOT exported —
 * only semantic colour tokens, already resolved to literal colours, are public.
 */
import { resolveTokens } from "./resolve.js";
import { tokens } from "./tokens/index.js";

export { tokens, breakpoints } from "./tokens/index.js";
export { resolveTokens } from "./resolve.js";
export type {
  Token,
  Tokens,
  TokenValue,
  ColorMode,
  OverrideNode,
  OverrideObject,
  ConditionSet,
  ResolvedRule,
} from "./types.js";

/**
 * Every finalized rule across all tokens, sorted by ascending specificity — the
 * same data `tokens.css` is generated from, for consumers that resolve tokens
 * themselves instead of relying on the CSS cascade.
 */
export const resolvedTokens = resolveTokens(tokens);
