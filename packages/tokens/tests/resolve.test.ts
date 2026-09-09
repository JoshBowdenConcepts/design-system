import { describe, expect, it } from "vitest";
import { resolvePaletteRef } from "../src/palette.js";
import { compareRules, flattenToken, parseAxisKey, resolveTokens, specificity } from "../src/resolve.js";
import { tokens } from "../src/tokens/index.js";
import type { ResolvedRule } from "../src/types.js";
import {
  allAxes,
  baseOnly,
  duplicateCondition,
  emptyOverride,
  malformedBreakpoint,
  malformedScope,
  missingBase,
  nestedOrderA,
  nestedOrderB,
  unknownColorMode,
  unrecognisedKey,
} from "./fixtures.js";

const rule = (rules: ResolvedRule[], key: string): ResolvedRule | undefined =>
  rules.find((r) => `cm=${r.conditions.colorMode ?? ""}|mw=${r.conditions.minWidth ?? ""}|sc=${r.conditions.scope ?? ""}` === key);

describe("parseAxisKey", () => {
  it("classifies each axis by its marker", () => {
    expect(parseAxisKey("dark", "t")).toEqual({ axis: "colorMode", colorMode: "dark" });
    expect(parseAxisKey("768$", "t")).toEqual({ axis: "mediaQuery", minWidth: 768 });
    expect(parseAxisKey(".compact", "t")).toEqual({ axis: "scope", scope: "compact" });
  });

  it("rejects malformed keys, naming the token and the key", () => {
    expect(() => parseAxisKey("value", "t")).toThrow(/reserved/);
    expect(() => parseAxisKey("weird key", "t.x")).toThrow(/t\.x.*unrecognised override key.*weird key/);
    expect(() => parseAxisKey("night", "t.x")).toThrow(/t\.x.*unknown color mode.*night/);
    expect(() => parseAxisKey("0$", "t.x")).toThrow(/t\.x.*malformed breakpoint key.*0\$/);
    expect(() => parseAxisKey("768", "t.x")).toThrow(/malformed breakpoint key/);
    expect(() => parseAxisKey(".Compact", "t.x")).toThrow(/t\.x.*malformed scope key/);
  });
});

describe("specificity", () => {
  it("weights colour mode 1, media query 2, scope 4 (summed)", () => {
    expect(specificity({})).toBe(0);
    expect(specificity({ colorMode: "dark" })).toBe(1);
    expect(specificity({ minWidth: 768 })).toBe(2);
    expect(specificity({ colorMode: "dark", minWidth: 768 })).toBe(3);
    expect(specificity({ scope: "x" })).toBe(4);
    expect(specificity({ colorMode: "dark", minWidth: 768, scope: "x" })).toBe(7);
  });

  it("ranks any scoped rule above any unscoped rule", () => {
    expect(specificity({ scope: "x" })).toBeGreaterThan(specificity({ colorMode: "dark", minWidth: 768 }));
  });
});

describe("flattenToken", () => {
  it("emits a base rule for a token with no overrides", () => {
    const rules = flattenToken("space.md", baseOnly);
    expect(rules).toEqual([
      { name: "space.md", conditions: {}, value: "1rem", specificity: 0 },
    ]);
  });

  it("is independent of nesting order", () => {
    const a = flattenToken("a", nestedOrderA);
    const b = flattenToken("b", nestedOrderB);
    const combinedA = rule(a, "cm=dark|mw=768|sc=");
    const combinedB = rule(b, "cm=dark|mw=768|sc=");
    expect(combinedA?.value).toBe("combined");
    expect(combinedA?.conditions).toEqual({ colorMode: "dark", minWidth: 768 });
    expect(combinedB?.conditions).toEqual(combinedA?.conditions);
    expect(combinedB?.value).toBe(combinedA?.value);
    expect(combinedB?.specificity).toBe(combinedA?.specificity);
  });

  it("treats a bare leaf as `{ value: leaf }`", () => {
    const long = flattenToken("x", { value: "b", overrides: { dark: { value: "d" } } });
    const short = flattenToken("x", { value: "b", overrides: { dark: "d" } });
    expect(short).toEqual(long);
  });

  it("resolves a full three-axis combination", () => {
    const rules = flattenToken("t", allAxes);
    const triple = rule(rules, "cm=dark|mw=768|sc=compact");
    expect(triple).toMatchObject({ value: "1.2rem", specificity: 7 });
  });
});

describe("flattenToken — rejection matrix", () => {
  it("R1: missing base value", () => {
    expect(() => flattenToken("color.x", missingBase)).toThrow(/color\.x.*missing base value/);
  });
  it("R3: unrecognised override key", () => {
    expect(() => flattenToken("t.x", unrecognisedKey)).toThrow(/t\.x.*unrecognised override key.*weird key/);
  });
  it("R4: unknown colour mode", () => {
    expect(() => flattenToken("t.x", unknownColorMode)).toThrow(/t\.x.*unknown color mode.*night/);
  });
  it("R5: malformed breakpoint key", () => {
    expect(() => flattenToken("t.x", malformedBreakpoint)).toThrow(/t\.x.*malformed breakpoint key.*0\$/);
  });
  it("R6: malformed scope key", () => {
    expect(() => flattenToken("t.x", malformedScope)).toThrow(/t\.x.*malformed scope key/);
  });
  it("R7: two paths reduce to the same condition-set", () => {
    expect(() => flattenToken("t.x", duplicateCondition)).toThrow(/t\.x.*duplicate condition/);
  });
  it("R8: empty override node", () => {
    expect(() => flattenToken("t.x", emptyOverride)).toThrow(/t\.x.*empty override/);
  });
});

describe("resolvePaletteRef (R10)", () => {
  it("resolves a known key to its literal colour", () => {
    expect(resolvePaletteRef("neutral.0", "color.bg")).toBe("#ffffff");
  });
  it("throws naming the token and the missing key", () => {
    expect(() => resolvePaletteRef("brand.999", "color.bg")).toThrow(
      /color\.bg.*unknown palette key.*brand\.999/,
    );
  });
});

describe("resolveTokens — real token source", () => {
  const rules = resolveTokens(tokens);

  it("emits colour tokens as literal colours, never palette refs", () => {
    const colourRules = rules.filter((r) => r.name.startsWith("color."));
    expect(colourRules.length).toBeGreaterThan(0);
    for (const r of colourRules) {
      expect(String(r.value)).toMatch(/^#[0-9a-f]{3,8}$/i);
    }
  });

  it("multiple breakpoints on one token order by ascending min-width", () => {
    const t = flattenToken("t", {
      value: "a",
      overrides: { "480$": "b", "1024$": "c", "768$": "d" },
    }).sort(compareRules);
    const widths = t.filter((r) => r.conditions.minWidth !== undefined).map((r) => r.conditions.minWidth);
    expect(widths).toEqual([480, 768, 1024]);
  });

  it("is sorted by non-decreasing specificity", () => {
    for (let i = 1; i < rules.length; i++) {
      expect(rules[i]!.specificity).toBeGreaterThanOrEqual(rules[i - 1]!.specificity);
    }
  });

  it("is deterministic", () => {
    expect(resolveTokens(tokens)).toEqual(rules);
  });
});
