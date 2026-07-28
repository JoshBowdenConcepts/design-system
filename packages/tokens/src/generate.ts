/**
 * Custom token generator.
 *
 * Reads the TypeScript token sources and emits web artifacts:
 *   - dist/variables.css  — CSS custom properties, with color-mode scoping
 *   - dist/manifest.json  — serialized token set for docs/tooling
 *
 * Color modes are attribute-scoped: semantic tokens are (re)declared inside
 * `:root`, `[data-color-mode="<mode>"]`, and a `prefers-color-scheme` fallback,
 * so consumers switch modes by toggling `data-color-mode` on a root element.
 * `color-scheme` is kept in sync for native UI (form controls, scrollbars).
 *
 * Internal primitive groups (the palette) are not emitted as CSS variables;
 * semantic aliases are resolved to their raw values inline.
 *
 * (Breakpoint/feature variants and iOS Swift output come in later phases.)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { groups } from "./tokens";
import {
  COLOR_MODES,
  DEFAULT_COLOR_MODE,
  type ColorMode,
  type FontFamilyGroup,
  type PrimitiveGroup,
  type SemanticGroup,
} from "./types";
import type {
  TokenManifest,
  TokenManifestEntry,
  TokenManifestGroup,
} from "./manifest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist");

const cssVarName = (prefix: string, key: string) => `--${prefix}-${key}`;
const decl = (name: string, value: string) => `  ${name}: ${value};`;

const primitiveGroups = groups.filter(
  (g): g is PrimitiveGroup => g.kind === "primitive",
);
const semanticGroups = groups.filter(
  (g): g is SemanticGroup => g.kind === "semantic",
);
const fontGroups = groups.filter(
  (g): g is FontFamilyGroup => g.kind === "font",
);

/** Resolve a primitive key to its raw value, for manifest display. */
function primitiveLookup(): Map<string, string> {
  const map = new Map<string, string>();
  for (const group of primitiveGroups) {
    for (const [key, value] of Object.entries(group.tokens)) {
      map.set(`${group.name}:${key}`, value);
    }
  }
  return map;
}

const lookup = primitiveLookup();

function resolveRef(prefix: string, ref: string): string {
  const value = lookup.get(`${prefix}:${ref}`);
  if (value === undefined) {
    throw new Error(
      `Semantic token references unknown primitive "${prefix}:${ref}".`,
    );
  }
  return value;
}

/** Groups exposed publicly (palette primitives are internal-only). */
const publicGroups = groups.filter(
  (g) => !(g.kind === "primitive" && g.internal),
);

function buildManifest(): TokenManifest {
  const manifestGroups: TokenManifestGroup[] = publicGroups.map((group) => {
    let tokens: TokenManifestEntry[];
    if (group.kind === "primitive") {
      tokens = Object.entries(group.tokens).map(([key, value]) => {
        const cssVar = cssVarName(group.name, key);
        return {
          kind: "primitive",
          key,
          cssVar,
          cssRef: `var(${cssVar})`,
          value,
        };
      });
    } else if (group.kind === "font") {
      tokens = Object.entries(group.tokens).map(([key, token]) => {
        const cssVar = cssVarName(group.name, key);
        return {
          kind: "font",
          key,
          cssVar,
          cssRef: `var(${cssVar})`,
          stack: token.stack,
          ...(token.google ? { google: token.google } : {}),
        };
      });
    } else {
      tokens = Object.entries(group.tokens).map(([key, modeMap]) => {
        const cssVar = cssVarName(group.name, key);
        const modes = {} as Record<ColorMode, { ref: string; value: string }>;
        for (const mode of COLOR_MODES) {
          const ref = modeMap[mode];
          modes[mode] = { ref, value: resolveRef(group.name, ref) };
        }
        return {
          kind: "semantic",
          key,
          cssVar,
          cssRef: `var(${cssVar})`,
          modes,
        };
      });
    }
    return {
      name: group.name,
      category: group.category,
      kind: group.kind,
      tokens,
    };
  });

  return {
    modes: [...COLOR_MODES],
    defaultMode: DEFAULT_COLOR_MODE,
    groups: manifestGroups,
  };
}

/** `color-scheme` value for a mode (only the two native schemes are valid). */
function colorSchemeFor(mode: ColorMode): string | null {
  return mode === "light" || mode === "dark" ? mode : null;
}

/** Public (non-internal) primitive declarations, e.g. the spacing scale. */
function primitiveDecls(): string[] {
  return primitiveGroups
    .filter((group) => !group.internal)
    .flatMap((group) =>
      Object.entries(group.tokens).map(([key, value]) =>
        decl(cssVarName(group.name, key), value),
      ),
    );
}

/**
 * Semantic declarations resolved for a single mode. Aliases resolve to their
 * raw primitive values inline (the internal palette is not emitted as vars).
 */
function semanticDecls(mode: ColorMode): string[] {
  return semanticGroups.flatMap((group) =>
    Object.entries(group.tokens).map(([key, modeMap]) =>
      decl(cssVarName(group.name, key), resolveRef(group.name, modeMap[mode])),
    ),
  );
}

/** Font-family custom property declarations (e.g. --font-family-body). */
function fontDecls(): string[] {
  return fontGroups.flatMap((group) =>
    Object.entries(group.tokens).map(([key, token]) =>
      decl(cssVarName(group.name, key), token.stack),
    ),
  );
}

/**
 * A single Google Fonts `@import` covering every token that declares a
 * `google` spec, or null when no families need fetching. Families are combined
 * into one css2 request and `display=swap` keeps text visible while they load.
 * De-duplicates by family so a font referenced by multiple tokens is fetched
 * once (the widest axes spec wins).
 */
function googleFontImport(): string | null {
  const byFamily = new Map<string, string | undefined>();
  for (const group of fontGroups) {
    for (const token of Object.values(group.tokens)) {
      const spec = token.google;
      if (!spec) continue;
      const existing = byFamily.get(spec.family);
      // Prefer the more specific (longer) axes list when duplicated.
      if (existing === undefined || (spec.axes ?? "").length > existing.length) {
        byFamily.set(spec.family, spec.axes ?? "");
      }
    }
  }
  if (byFamily.size === 0) return null;

  const families = [...byFamily.entries()].map(([family, axes]) => {
    const name = family.replace(/ /g, "+");
    return axes ? `${name}:${axes}` : name;
  });
  const query = families.map((f) => `family=${f}`).join("&");
  return `@import url('https://fonts.googleapis.com/css2?${query}&display=swap');`;
}

function buildCss(): string {
  const blocks: string[] = [
    "/* Generated by @design-system/tokens — do not edit by hand. */",
  ];

  // `@import` must precede all other rules (comments are fine before it), so
  // the Google Fonts request is emitted right after the banner comment.
  const fontImport = googleFontImport();
  if (fontImport) blocks.push(fontImport);

  const scheme = colorSchemeFor(DEFAULT_COLOR_MODE);
  const rootDecls = [
    ...primitiveDecls(),
    ...fontDecls(),
    ...semanticDecls(DEFAULT_COLOR_MODE),
    ...(scheme ? [decl("color-scheme", scheme)] : []),
  ];
  blocks.push(`:root {\n${rootDecls.join("\n")}\n}`);

  // One explicit block per mode so nested overrides work (a dark subtree can
  // contain a light island via [data-color-mode="light"], and vice versa).
  for (const mode of COLOR_MODES) {
    const modeScheme = colorSchemeFor(mode);
    const modeDecls = [
      ...semanticDecls(mode),
      ...(modeScheme ? [decl("color-scheme", modeScheme)] : []),
    ];
    blocks.push(`[data-color-mode="${mode}"] {\n${modeDecls.join("\n")}\n}`);
  }

  // Follow the OS preference when no explicit mode is set (and not forced light).
  if ((COLOR_MODES as readonly string[]).includes("dark")) {
    const darkDecls = [
      ...semanticDecls("dark"),
      ...(colorSchemeFor("dark") ? [decl("color-scheme", "dark")] : []),
    ].map((d) => `  ${d}`);
    blocks.push(
      `@media (prefers-color-scheme: dark) {\n  :root:not([data-color-mode="light"]) {\n${darkDecls.join(
        "\n",
      )}\n  }\n}`,
    );
  }

  return blocks.join("\n\n") + "\n";
}

async function main() {
  const manifest = buildManifest();
  const css = buildCss();

  await mkdir(distDir, { recursive: true });
  await Promise.all([
    writeFile(join(distDir, "variables.css"), css, "utf8"),
    writeFile(
      join(distDir, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
      "utf8",
    ),
  ]);

  const tokenCount = manifest.groups.reduce(
    (sum, g) => sum + g.tokens.length,
    0,
  );
  console.log(
    `Generated ${tokenCount} tokens across ${manifest.groups.length} group(s), modes: ${manifest.modes.join(
      ", ",
    )} -> ${distDir}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
