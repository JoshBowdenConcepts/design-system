# Phase 0 Research: Core Packages Scaffold

All items below were either constrained by the constitution / clarifications or
carried a small planning-phase decision. No blocking `NEEDS CLARIFICATION`
remained after `/speckit-clarify`.

## 1. Monorepo tooling

**Decision**: pnpm 9 workspaces (via Corepack) + Turborepo 2. Root
`pnpm-workspace.yaml` globs `packages/*` and `apps/*`. Turborepo `build` task
declares `dependsOn: ["^build"]` and `outputs: ["dist/**"]`; `dev` uses
`turbo watch` to rebuild dependents on source change.

**Rationale**: Mandated by the constitution's Technology Constraints. Turborepo's
`^build` ordering directly satisfies FR-008 (rebuild dependents) and the
"build dependency before dependent" edge case; its content hashing keeps SC-003
rebuilds fast.

**Alternatives considered**: Nx (heavier, not constitution-sanctioned); npm/yarn
workspaces (constitution fixes pnpm); Lerna (unmaintained for this use).

## 2. Per-package build strategy

**Decision**:
- **tokens**: `tsx src/generate.ts` runs the custom generator (emits
  `dist/web/tokens.css`, `dist/web/index.js`, `dist/web/index.d.ts`, and
  `dist/ios/DesignSystemTokens/*.swift`). A separate `tsc --noEmit` typechecks
  source.
- **icons**: `tsx src/generate.ts` transforms `src/svg/*.svg` into React
  components + a Swift stub, then `tsc` emits `dist/web`.
- **components**: `tsc` emits `dist/web` (JS + `.d.ts`) from `src/*.tsx`;
  `tsx src/generate.ts` emits the Swift stub into `dist/ios`.

**Rationale**: The constitution requires a *custom* TypeScript generator for
tokens (no Style Dictionary). Plain `tsc` for icons/components keeps the scaffold
minimal and dependency-light while producing real `.d.ts` for typed public APIs
(Principle V). `tsx` (already common, zero-config) runs the generator scripts
without a separate bundler.

**Alternatives considered**: `tsup`/`unbuild` (extra dependency, unnecessary for
placeholder output); Vite library mode (overkill, docs app already brings Vite).

## 3. Web styling output format

**Decision**: The tokens generator emits `dist/web/tokens.css` containing CSS
custom properties. Variant axes resolve via nested selector blocks:
`:root { … }` for defaults, `@media (min-width: …) { :root { … } }` for
breakpoints, `[data-theme="dark"] { … }` for color mode, and
`.<feature-class> { … }` for feature flags. It also emits `dist/web/index.js` +
`index.d.ts` exporting the raw token values/types for JS consumers.

**Rationale**: Locked by `/speckit-clarify` (FR-006a). CSS custom properties give
runtime color-mode switching without rebuilds and keep the generator simple. No
CSS Modules in token output.

**Alternatives considered**: CSS Modules, both — rejected in clarification.

## 4. iOS output layout

**Decision**: One committed `Package.swift` at the repo root declaring three
library products/targets: `DesignSystemTokens`, `DesignSystemIcons`,
`DesignSystemComponents`. Each target's `path` points at
`packages/<layer>/dist/ios/DesignSystem<Layer>/`. Target dependencies mirror the
one-way graph: Icons → Tokens; Components → Tokens + Icons. Swift sources in
those directories are generated stubs (a single `<Layer>.swift` with a namespace
enum and, for tokens, one placeholder constant); `dist/` stays gitignored.

**Rationale**: Locked by `/speckit-clarify` (FR-007). A single manifest means an
iOS consumer adds `.package(path: "…/design-system")` once and depends on
individual products. `Package.swift` is a manifest (not a design value) so it is
hand-authored and committed; only Swift *sources* are generated, satisfying
Principle II. Resolution works "after a build" per SC-005 — acceptable because
the spec never requires a fresh clone to resolve Swift without building.

**Alternatives considered**: Per-package `Package.swift` (rejected in
clarification); committing generated Swift outside `dist/` (adds diff noise,
no benefit for a stub).

## 5. One-way dependency enforcement (FR-003 / SC-004)

**Decision**: Custom `scripts/check-deps.mjs` (Node, no dependencies) is the
canonical control. It:
1. Reads every `packages/*/package.json`.
2. Fails if any `packages/*` dir exists outside the allowed set
   {tokens, icons, components} (rejects a 4th layer).
3. Validates each package's `dependencies` against the allowed matrix
   (tokens: none; icons: tokens; components: tokens + icons) and fails on any
   `@design-system/*` dependency outside it — including cycles.
Run in CI and as a `pretest` / `prebuild` hook. A secondary ESLint
`no-restricted-imports` / `import/no-restricted-paths` rule catches disallowed
`import` statements in source for faster local feedback.

**Rationale**: Principle V requires enforcement by tooling, before review. A tiny
custom script is transparent, fast, has zero supply-chain cost, and gives a
clear error message naming the offending package — matching the edge-case
requirement. pnpm's workspace graph already blocks true cycles at install;
the script adds the "wrong direction" and "no 4th layer" checks the graph
alone does not give.

**Alternatives considered**: `dependency-cruiser` (capable but heavy config for
one rule); `eslint-plugin-boundaries` alone (misses `package.json`-level deps and
the 4th-layer check); relying on convention (violates Principle V).

## 6. Test framework

**Decision**: Vitest 2. Root `vitest.workspace.ts` aggregates per-package
`tests/` projects. Each package exposes its own `test` script (SC-002). The
tokens package includes contract tests asserting generator output: token names,
resolved values, and presence/shape of the CSS selector blocks.

**Rationale**: Deferred from `/speckit-clarify` as a planning decision. Vitest is
the standard for a TS + Vite + React stack, shares config with the Storybook
Vite builder, and needs no Babel/ts-jert plumbing. Constitution Quality Gates
require contract tests on emitted token output — Vitest's snapshot + assertion
API covers this.

**Alternatives considered**: Jest (extra transform config, slower ESM story);
node:test (workable but no snapshot ergonomics for generator output).

## 7. Local web dev/preview environment (FR-009)

**Decision**: `apps/docs` runs Storybook 8 with `@storybook/react-vite`. It is a
private, unversioned app (not a package). It includes one placeholder story per
package importing that package's built web output, plus `@storybook/addon-a11y`.
`pnpm dev` runs `turbo watch` + `storybook dev` so a package source change is
reflected after rebuild (SC-003).

**Rationale**: Storybook is the constitution-mandated web documentation surface.
Vite builder aligns with the Vitest choice and gives fast HMR.

**Alternatives considered**: A bespoke Vite demo app (constitution names
Storybook specifically); Storybook Webpack builder (slower, more config).

## 8. Placeholder content (FR-005 / FR-010)

**Decision**: Each package ships exactly one minimal placeholder so the pipeline
is verifiable without real content:
- tokens: `placeholder.ts` → one token named `placeholder` (value `0`) emitted
  to CSS (`--ds-placeholder: 0;`), JS, and Swift. Deliberately not a real
  scale value.
- icons: `placeholder.svg` (a 1-path square) → one generated React component
  `PlaceholderIcon` + a Swift stub.
- components: `Placeholder.tsx` — a `<div>` that consumes the placeholder token
  via `var(--ds-placeholder)`, proving the tokens→components consumption path.

**Rationale**: Satisfies "empty-but-well-formed" while giving each generator a
non-trivial input to exercise. All are clearly labelled placeholder and removed
when real content lands.

**Alternatives considered**: Zero content (generators have nothing to exercise,
weaker verification); multiple placeholders (unnecessary, risks looking like
real content).

## 9. CI

**Decision**: `.github/workflows/ci.yml` on push / PR: Corepack enable → `pnpm
install --frozen-lockfile` → `pnpm build` → `pnpm test` → `node scripts/check-deps.mjs`
→ `pnpm lint` → `pnpm --filter docs build-storybook` → `npx playwright install
--with-deps chromium` → serve `storybook-static` + `pnpm --filter docs test-storybook`.
Node 24 matrix entry (≥ constitution floor).

**Rationale**: Principle V — every gate runs in CI before merge. `check-deps`
before review satisfies SC-004's "100% of the time, before code review". The
Storybook test-runner step is the FR-011 merge gate for accessibility and
visual regression.

**Alternatives considered**: Splitting into parallel jobs (premature for scaffold
size; one job keeps well under budget).

## 10. Visual regression & accessibility gates (FR-011 / Constitution IV, V)

**Decision**: `@storybook/test-runner` (Playwright-based) runs in CI against the
built Storybook. Two assertions per story: (a) `axe-playwright` accessibility
checks configured for WCAG 2.2 AA, failing on any violation; (b) a DOM snapshot
compared to a committed baseline under `apps/docs/src/__snapshots__/`. Config lives
in `apps/docs/.storybook/test-runner.ts` (`postVisit` hook). The only rendered
output in this feature is the `Placeholder` component, so the baselines are
trivial, but the harness is real and green from day one.

**Rationale**: Constitution V ("Visual regression MUST gate changes to rendered
component appearance") and IV ("Accessibility ... MUST be gated before merge")
are MUST principles; a rendered `Placeholder` component plus Storybook means
the gate must exist now, not be deferred. `@storybook/test-runner` is the
first-party tool, self-contained (no external VR service), and reuses the
existing `@storybook/addon-a11y` configuration.

**Alternatives considered**: Chromatic / Percy (external service, out of scope
for a self-hosted scaffold); `jest-image-snapshot` standalone (more wiring, no
a11y integration); deferring the harness (conflicts with a MUST principle once
`Placeholder` renders).
