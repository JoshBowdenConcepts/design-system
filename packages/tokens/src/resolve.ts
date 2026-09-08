/**
 * Flattens each token's recursive `overrides` tree into a sorted list of
 * `ResolvedRule`s — one per distinct condition-set — and is the single source
 * both the CSS generator and the public `resolvedTokens` export consume, so the
 * two views of a token can never disagree.
 *
 * Axis specificity: colour mode = 1, media query = 2, class-name scope = 4,
 * summed. Any multi-axis combination therefore outranks every one of its
 * single-axis parts, and any rule containing a scope outranks any rule without
 * one (spec Clarifications / research D3).
 */
import type {
  ColorMode,
  ConditionSet,
  OverrideNode,
  ResolvedRule,
  Token,
  Tokens,
  TokenValue,
} from "./types.js";

const BREAKPOINT_KEY = /^[1-9][0-9]*\$$/;
const SCOPE_KEY = /^\.[a-z][a-z0-9-]*$/;

type Axis =
  | { axis: "colorMode"; colorMode: ColorMode }
  | { axis: "mediaQuery"; minWidth: number }
  | { axis: "scope"; scope: string };

/** Classify one override key by its axis marker, or throw naming the token. */
export function parseAxisKey(key: string, tokenName: string): Axis {
  if (key === "value") {
    throw new Error(`${tokenName}: 'value' is reserved and cannot be an override key`);
  }
  if (key === "light" || key === "dark") {
    return { axis: "colorMode", colorMode: key };
  }
  if (key.startsWith(".")) {
    if (!SCOPE_KEY.test(key)) {
      throw new Error(`${tokenName}: malformed scope key '${key}'`);
    }
    return { axis: "scope", scope: key.slice(1) };
  }
  if (key.startsWith("$") || key.endsWith("$") || /^[0-9]/.test(key)) {
    if (!BREAKPOINT_KEY.test(key)) {
      throw new Error(`${tokenName}: malformed breakpoint key '${key}'`);
    }
    return { axis: "mediaQuery", minWidth: Number(key.slice(0, -1)) };
  }
  if (/^[a-z][a-z-]*$/.test(key)) {
    throw new Error(`${tokenName}: unknown color mode '${key}'`);
  }
  throw new Error(`${tokenName}: unrecognised override key '${key}'`);
}

/** Specificity weight of a condition-set: 0..7 (research D3). */
export function specificity(c: ConditionSet): number {
  return (
    (c.colorMode !== undefined ? 1 : 0) +
    (c.minWidth !== undefined ? 2 : 0) +
    (c.scope !== undefined ? 4 : 0)
  );
}

function conditionKey(c: ConditionSet): string {
  return `cm=${c.colorMode ?? ""}|mw=${c.minWidth ?? ""}|sc=${c.scope ?? ""}`;
}

function withAxis(c: ConditionSet, axis: Axis, tokenName: string): ConditionSet {
  const next: ConditionSet = { ...c };
  if (axis.axis === "colorMode") {
    if (next.colorMode !== undefined) {
      throw new Error(`${tokenName}: colour mode set more than once on one override path`);
    }
    next.colorMode = axis.colorMode;
  } else if (axis.axis === "mediaQuery") {
    if (next.minWidth !== undefined) {
      throw new Error(`${tokenName}: breakpoint set more than once on one override path`);
    }
    next.minWidth = axis.minWidth;
  } else {
    if (next.scope !== undefined) {
      throw new Error(`${tokenName}: scope set more than once on one override path`);
    }
    next.scope = axis.scope;
  }
  return next;
}

/** Flatten one token to its rules. Throws on every authoring error in the
 *  rejection matrix that is not a `tsc`-level type error. */
export function flattenToken(name: string, token: Token): ResolvedRule[] {
  if (token.value === undefined || token.value === null) {
    throw new Error(`${name}: missing base value`);
  }

  const rules: ResolvedRule[] = [];
  const seen = new Set<string>();

  const emit = (conditions: ConditionSet, value: TokenValue): void => {
    const key = conditionKey(conditions);
    if (seen.has(key)) {
      throw new Error(`${name}: duplicate condition {${key}}`);
    }
    seen.add(key);
    rules.push({ name, conditions, value, specificity: specificity(conditions) });
  };

  emit({}, token.value);

  const walk = (node: OverrideNode, conditions: ConditionSet, label: string, root: boolean): void => {
    if (typeof node !== "object" || node === null) {
      emit(conditions, node);
      return;
    }
    let sawAxis = false;
    let sawValue = false;
    for (const [key, child] of Object.entries(node)) {
      if (child === undefined) continue;
      if (key === "value") {
        if (typeof child === "object" && child !== null) {
          throw new Error(`${name}: 'value' must be a leaf, not an object`);
        }
        sawValue = true;
        emit(conditions, child);
        continue;
      }
      sawAxis = true;
      const axis = parseAxisKey(key, name);
      walk(child, withAxis(conditions, axis, name), key, false);
    }
    if (!root && !sawAxis && !sawValue) {
      throw new Error(`${name}: empty override at '${label}'`);
    }
  };

  if (token.overrides) {
    walk(token.overrides as OverrideNode, {}, "overrides", true);
  }

  return rules;
}

const colorModeOrder = (m: ColorMode | undefined): number =>
  m === undefined ? 0 : m === "light" ? 1 : 2;

/** Total order: ascending specificity, then min-width, then colour-mode
 *  (`light` before `dark`), then scope name, then token name (research D9). */
export function compareRules(a: ResolvedRule, b: ResolvedRule): number {
  if (a.specificity !== b.specificity) return a.specificity - b.specificity;
  const amw = a.conditions.minWidth ?? 0;
  const bmw = b.conditions.minWidth ?? 0;
  if (amw !== bmw) return amw - bmw;
  const acm = colorModeOrder(a.conditions.colorMode);
  const bcm = colorModeOrder(b.conditions.colorMode);
  if (acm !== bcm) return acm - bcm;
  const asc = a.conditions.scope ?? "";
  const bsc = b.conditions.scope ?? "";
  if (asc !== bsc) return asc < bsc ? -1 : 1;
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

/** Every finalized rule across all tokens, sorted for emission. */
export function resolveTokens(tokenSet: Tokens): ResolvedRule[] {
  const rules: ResolvedRule[] = [];
  for (const [name, token] of Object.entries(tokenSet)) {
    rules.push(...flattenToken(name, token));
  }
  return rules.sort(compareRules);
}
