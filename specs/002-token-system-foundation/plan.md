# Implementation Plan: Token System Foundation

**Branch**: `002-token-system-foundation` | **Date**: 2026-09-07 (rev. after clarify — palette layer) | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-token-system-foundation/spec.md`

## Summary

Replace the `@design-system/tokens` scaffold's single `placeholder` token with a
real authoring system: one TypeScript source file per token category (`type`,
`space`, `color`, …), each token carrying one base value plus an optional
**recursive override tree**. Override keys are axis-marked — bare `light`/`dark`
(color mode), `<number>$` (min-width breakpoint), `.<name>` (class-name scope) —
and nest in any order to any depth. A new resolver flattens each tree to a set of
`(condition-set → value)` rules, assigns each an integer specificity, rejects
authoring errors, and sorts deterministically. The custom generator projects the
sorted rules into `dist/web/tokens.css` as CSS custom properties wrapped in the
correct `:root` / `@media` / `[data-theme]` / class-name blocks, ordered so the
most specific matching condition wins purely through the cascade. Typography
values are whole CSS `font` shorthand strings, passed through untouched. The
colour category is authored as a **private palette** (a plain TS constant, never
emitted or exported) plus **semantic colour tokens** whose base value and
overrides are palette references resolved to literal colours at build time — the
output and public API contain only `--ds-color-<role>`, never a palette entry.
Swift output stays base-value-only this phase. Storybook gains a table + override
demo per category.

## Technical Context

**Language/Version**: TypeScript 5.7 on Node.js 22+ (CI: Node 24). Swift tools
5.9 for the existing iOS manifest (unchanged by this feature).

**Primary Dependencies**: No new runtime or build dependencies. Existing:
`tsx` (runs `generate.ts`), `tsc` (emits typed JS entry), Vitest 2 (generator +
resolver contract tests), Turborepo (`^build` ordering), Storybook 8 +
`@storybook/test-runner` (docs, visual-regression + axe gates).

**Storage**: N/A — all output is generated files under `packages/tokens/dist/`
(gitignored).

**Testing**: Vitest per package. New `tests/resolve.test.ts` (tree flattening,
order-independence, specificity ordering, palette-reference resolution, every
rejection path) and an expanded `tests/generate.test.ts` (CSS block structure &
ordering, **a cascade-resolution assertion — emitted selector specificity is
non-decreasing across emission order so the last matching rule always wins**,
`font` passthrough, no `--ds-palette-*` in output, determinism,
empty-but-well-formed, Swift base values). Constitution Quality Gate:
generator/schema changes require contract tests of emitted output (names, values,
variant resolution) — satisfied by these two files.

**Target Platform**: Web (CSS custom properties consumed by React/Storybook and
any CSS consumer) primary; typed JS/TS data structure for non-CSS consumers; iOS
Swift constants (base values only) secondary.

**Project Type**: Single-package change inside the existing pnpm + Turborepo
monorepo (`packages/tokens`), plus its Storybook stories in `apps/docs`.

**Performance Goals**: `pnpm --filter @design-system/tokens build` completes in
well under the 5-minute clean-build budget (SC-001 carried from 001). Source edit
visible in a running Storybook in < 30 s (SC-003 carried from 001).

**Constraints**: Output byte-identical for identical source regardless of
override nesting order (FR-010, SC-003). No runtime resolution logic in consumers
— cascade only (FR-008). Every authoring error names the offending token and key
before any file is written (FR-007, FR-016, SC-004). Builds succeed on an empty
category or empty token set (FR-011). Placeholder values only; real values must
not need a schema change (FR-012). The colour palette is never emitted to CSS and
never in the public typed API (FR-015); semantic colour values are resolved
literals (FR-016, SC-007).

**Scale/Scope**: 1 package touched. ~3 category files seeded with ~2–4
placeholder tokens each, at least one exercising all three axes; colour adds a
small private palette module. 1 new resolver module. 2 test files. 1 Storybook
stories file updated. 2 contract docs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate for this feature | Status |
|---|-----------|-----------------------|--------|
| I | Tokens Are the Source of Truth | Every value originates in `packages/tokens/src/`. One category per file (Principle I: "each theme part … in its own source file"). Public names are semantic (`type.body`, `color.bg`); the colour ramp lives in a **private palette module** referenced at build time and never exported — directly satisfying "primitive or palette values MAY exist as internal references; public token APIs MUST expose semantic names, not raw ramps" (FR-015/016, spec Clarifications). The three override axes are exactly the constitution's variant axes — breakpoints, color modes, and features; **"class-name scope" is the axis the constitution calls *features***, generalised to arbitrary named scopes, with the selector prefix moving `.ds-feature-*` → `.ds-scope-*` (see research D12). No new axis is introduced — only a recursive authoring form and cross-axis combination. Each axis has a concrete consumer named in the spec. | PASS |
| II | Generate, Do Not Fork | One shared TS source; `tokens.css`, the typed JS entry, and `Tokens.swift` are all projections of it via one generator run. Swift emits base values only — a documented capability gap, not a competing value (no override is expressed differently for iOS; they are simply absent until a later feature). | PASS |
| III | Layered, Independently Shippable Packages | Only `packages/tokens` changes. No new package, no grouping package, no dependency added. `apps/docs` remains a consumer. | PASS |
| IV | Accessibility Is Non-Negotiable | Placeholder colors are not real palette values, but the dark-mode override path is built and demonstrated so real semantic pairings can be contrast-checked when they land. CI axe assertions over the token stories still run (Principle IV / FR-011 harness from 001). Contrast validation of real pairings is explicitly a later-feature gate. | PASS |
| V | Tooling Enforces the Contract | Typed recursive schema makes an invalid override shape, unknown color mode, or unknown palette key fail at `tsc`/build time (FR-014, FR-016). Generator + resolver contract tests assert emitted names, values, and **variant resolution** — including a cascade-resolution assertion (emitted selector specificity non-decreasing in emission order) so ordering correctness, not just block sequence, is gated (Quality Gate; analyze finding G1). Output is reproducible from source. Storybook documents every token category before the API is "complete". Visual-regression snapshots gate the rendered token stories. | PASS |

**Technology Constraints check**: custom TS token schema (not DTCG) ✓ · custom TS
generator (not Style Dictionary) ✓ · web styling output is CSS custom properties,
reaffirming 001's decision — not CSS Modules ✓ · TS + React + Storybook for web ✓
· Node 22+ ✓ · pnpm + Turborepo ✓

**Result (pre-Phase 0)**: No violations. Complexity Tracking not required.

**Re-check (post-Phase 1 design)**: Phase 1 artifacts add two internal modules
(`resolve.ts`, `palette.ts`) and category source files inside the existing
package — no new package, axis, dependency, or public-surface expansion beyond
the token categories the spec calls for. The private palette *narrows* the
public surface (raw colours never exported), reinforcing Principle I. The
recursive override tree resolves to the same three-axis model the constitution
already sanctions. All five principles still PASS; gate holds.

## Project Structure

### Documentation (this feature)

```text
specs/002-token-system-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── token-schema.md  # authoring shape + axis-key grammar + validation errors
│   └── css-output.md    # tokens.css block structure & ordering (supersedes 001's token-output.md for tokens)
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
packages/tokens/
├── package.json                 # unchanged (exports, scripts already correct)
├── tsconfig.json / tsconfig.build.json
├── src/
│   ├── index.ts                 # public entry: `tokens` (authored tree), `resolvedTokens`, types, `breakpoints` reference map
│   ├── types.ts                 # REWRITTEN: recursive override schema (Token, OverrideNode, Axis, ConditionSet, ResolvedRule)
│   ├── resolve.ts               # NEW: flatten override tree → ResolvedRule[]; axis-key parsing; validation; specificity; canonical sort
│   ├── palette.ts               # NEW: private colour ramp (plain const) + resolvePaletteRef(); NOT re-exported from index.ts
│   ├── generate.ts              # UPDATED: consume resolve.ts; emit tokens.css blocks in sorted order; Swift base values (identifier-sanitised)
│   └── tokens/
│       ├── index.ts             # UPDATED: import category files, namespace keys (`type.body`), assemble, reject duplicate final names
│       ├── type.ts              # NEW category — values are CSS `font` shorthand strings
│       ├── space.ts             # NEW category
│       └── color.ts             # NEW category — semantic roles; values/overrides are palette refs (import from ../palette.js)
│       # placeholder.ts removed
├── tests/
│   ├── resolve.test.ts          # NEW
│   └── generate.test.ts         # UPDATED
└── dist/                        # gitignored — web/{index.js,index.d.ts,tokens.css}, ios/DesignSystemTokens/Tokens.swift

apps/docs/
├── .storybook/preview.ts        # unchanged (already imports @design-system/tokens/tokens.css)
└── src/
    ├── Tokens.stories.tsx       # UPDATED: one table per category + a story toggling data-theme / scope class to show override resolution
    └── __snapshots__/Tokens.stories.tsx.snap  # regenerated baseline
```

**Structure Decision**: Single-package evolution. All schema, resolution, and
projection logic lives in `packages/tokens/src`; `resolve.ts` is a new internal
module (not a new public package) that both `generate.ts` (CSS/Swift) and
`index.ts` (typed data structure, FR-013) consume, guaranteeing the CSS and the
JS view of a token agree. `palette.ts` is a second internal-only module: the
colour ramp is a plain `const` and a `resolvePaletteRef` helper; `src/tokens/color.ts`
imports it, `src/index.ts` never re-exports it, and `generate.ts` only ever sees
already-resolved literal colours (FR-015/016). Category files under `src/tokens/`
follow the constitution's one-file-per-theme-part rule. `apps/docs` consumes the
built output exactly as today; only its stories and snapshot baseline change.

001's `contracts/token-output.md` described a flat `:root` / single-`@media` /
`[data-theme]` shape for the scaffold; `contracts/css-output.md` here supersedes
it for the tokens package. Updating the 001 contract doc with a pointer is a
task-phase cleanup, not a plan gate.

## Complexity Tracking

> No Constitution Check violations. Section intentionally empty.
