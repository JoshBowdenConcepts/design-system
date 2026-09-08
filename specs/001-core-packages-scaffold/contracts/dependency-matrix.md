# Contract: One-Way Dependency Matrix (FR-003 / SC-004 / Principle III)

## Allowed internal dependencies

| Package | MAY depend on | MUST NOT depend on |
|---------|---------------|--------------------|
| `@design-system/tokens` | — (nothing) | icons, components |
| `@design-system/icons` | tokens | components |
| `@design-system/components` | tokens, icons | — |

- Direction is one-way: **tokens → icons → components**.
- Cycles are forbidden.
- No package outside {tokens, icons, components} may live under `packages/`
  (no 4th layer, no grouping-only package).

## Enforcement contract — `scripts/check-deps.mjs`

Input: all `packages/*/package.json` + the list of `packages/*` directories.

Checks (each failure → `process.exit(1)`):

1. **No unknown package** — every `packages/*` dir name ∈ {tokens, icons,
   components}. Error: `Unexpected package "packages/<x>": only tokens, icons,
   components are allowed.`
2. **Correct name/scope** — each manifest `name` === `@design-system/<dir>`.
3. **Allowed deps only** — for each package, every `@design-system/*` key in
   `dependencies` ∪ `peerDependencies` ∪ `devDependencies` is in that package's
   MAY-column. Error: `packages/<x> depends on <dep>, which violates the one-way
   dependency direction (tokens → icons → components).`
4. **No cycles** — derived from (3); a back-edge is by definition outside the
   MAY-column and already fails.

Output on success: `dependency matrix OK (3 packages)` and exit 0.

Run points:
- CI job step (before merge → satisfies "before code review", SC-004).
- Local `pnpm check:deps`.
- Optional `prebuild` hook for fast feedback.

## Secondary guard — ESLint

`import/no-restricted-paths` (or `no-restricted-imports`) in `eslint.config.js`
forbids source imports that cross a disallowed boundary (e.g. anything in
`packages/tokens/**` importing `@design-system/icons`). This catches violations
at edit time; `check-deps.mjs` remains the authoritative gate.

## SwiftPM mirror

The root `Package.swift` target dependencies MUST match this matrix:
`DesignSystemIcons` → `[DesignSystemTokens]`;
`DesignSystemComponents` → `[DesignSystemTokens, DesignSystemIcons]`;
`DesignSystemTokens` → `[]`.
