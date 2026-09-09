---
description: "Task list for Token System Foundation"
---

# Tasks: Token System Foundation

**Input**: Design documents from `/specs/002-token-system-foundation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Test tasks ARE included — the project constitution's Quality Gates
require contract tests of emitted output (names, values, variant resolution) for
any token generator/schema change.

**Organization**: Grouped by user story. All three stories are P1 and share files
in `packages/tokens/src/`, so the recommended order is US1 → US2 → US3 even
though each is independently testable.

> **Regeneration note (rev. after `/speckit-clarify` — palette layer)**: this
> supersedes the previous 25-task list. The color category is now a **private
> palette** (`src/palette.ts`, never exported) plus semantic tokens that
> reference it, resolved to literal colours at build time. Also folds in the
> `/speckit-analyze` findings: G1 (cascade-resolution test), F1 (parallel-marker
> fix), C1 (`.ds-feature-*` → `.ds-scope-*` rename). No implementation had
> landed yet, so all tasks start unchecked.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 / US2 / US3 (setup, foundational, and polish tasks carry no story label)

## Path Conventions

Single-package change inside the existing pnpm + Turborepo monorepo. All paths
are repository-relative. Primary package: `packages/tokens/`. Docs: `apps/docs/`.

---

## Phase 1: Setup

**Purpose**: Shared test scaffolding used by every later phase.

- [x] T001 [P] Create `packages/tokens/tests/fixtures.ts` exporting shared token fixtures for both test files: a base-value-only token, a token with overrides across all three axes (color mode + `NNN$` breakpoint + `.scope`), a matched pair whose overrides express the same condition-set in two different nesting orders, a semantic-colour token whose leaves are palette refs, an empty category (`{}`), and one fixture per invalid case in the rejection matrix (`contracts/token-schema.md` R1, R3–R8, R10).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The schema rewrite every user story builds on. Must land with a
green `pnpm --filter @design-system/tokens build`.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Rewrite `packages/tokens/src/types.ts` per `contracts/token-schema.md`: `TokenValue`, `ColorMode`, recursive `OverrideNode`, `Token` (`{ value; description?; overrides? }`), `Tokens`, `ConditionSet`, `ResolvedRule`. Remove the superseded `Breakpoints`, `TokenConfig`, and the flat `breakpoints`/`colorModes`/`features` fields. Update the module doc comment's `.ds-feature-*` reference to `.ds-scope-*` (research D12).
- [x] T003 In `packages/tokens/src/generate.ts` and `packages/tokens/src/index.ts`, restore compilation against the new types with a temporary base-values-only path (no override or palette emission yet) so the package build and typecheck pass before story work starts.

---

## Phase 3: User Story 1 — Author tokens as grouped TypeScript sets (Priority: P1)

**Goal**: Real tokens authored one category per file and assembled into one
finalized set; typography values are whole CSS `font` shorthand strings; colours
are semantic roles backed by a private palette that never reaches any output.

**Independent test**: Add a base value to each category file, run
`pnpm --filter @design-system/tokens build`, confirm `dist/web/tokens.css`'s
`:root` block has a `--ds-<category>-<name>` line for every authored token with
its (palette-resolved, for colour) base value, `grep -c ds-palette
dist/web/tokens.css` is `0`, and the build exits 0 (including with an empty
category).

- [x] T004 [P] [US1] Create `packages/tokens/src/palette.ts`: a private colour ramp `export const palette = { … } as const` with placeholder hex values (e.g. `neutral.0`, `neutral.900`, `blue.500`), `export type PaletteRef = keyof typeof palette`, and `export function resolvePaletteRef(ref: string, tokenName: string): string` that returns the literal colour or throws `"<tokenName>: unknown palette key '<ref>'"` (`contracts/token-schema.md` R10, research D11). This module is NOT re-exported from `src/index.ts`.
- [x] T005 [P] [US1] Create `packages/tokens/src/tokens/type.ts` exporting a `Tokens` record of placeholder typography tokens whose `value` is a full CSS `font` shorthand string (e.g. `body`, `heading`); give `body` overrides across all three axes so ordering is demonstrable (FR-003, FR-012, SC-006).
- [x] T006 [P] [US1] Create `packages/tokens/src/tokens/space.ts` exporting a `Tokens` record of placeholder spacing steps (e.g. `sm`, `md`, `lg`); give one token a `NNN$` breakpoint override plus a `.scope` override (SC-006).
- [x] T007 [US1] Create `packages/tokens/src/tokens/color.ts` exporting a `Tokens` record of semantic colour roles (e.g. `bg`, `fg`) whose base `value` and every override leaf is a `PaletteRef` string (import the type from `../palette.js`); give `bg` a `dark` palette-ref override and a `dark` + `.scope` combined palette-ref override (FR-015, SC-006). Depends on T004.
- [x] T008 [US1] Rewrite `packages/tokens/src/tokens/index.ts`: import the category files in a fixed declared order, namespace every key as `<category>.<key>`, run the `color` category's leaf values (base + overrides) through `resolvePaletteRef` during assembly so literal colours leave this module (FR-016), throw naming both source locations on a duplicate final `--ds-*` name (R9), and export `breakpoints = { sm: 640, md: 768, lg: 1024 } as const` as a reference-only map (research D6). Remove the `placeholder` import. Depends on T004–T007.
- [x] T009 [US1] Delete `packages/tokens/src/tokens/placeholder.ts` and update `packages/tokens/src/index.ts` public exports to expose `tokens` (assembled, palette-resolved tree) and the schema types; assert by inspection that `palette` / `PaletteRef` are NOT in the export list (FR-015). Depends on T008.
- [x] T010 [US1] Update `renderSwift` in `packages/tokens/src/generate.ts` to sanitize dotted namespaced keys to camelCase Swift identifiers (`type.body` → `typeBody`) and emit base values only (research D7); keep the empty-namespace-enum case.
- [x] T011 [P] [US1] Update `packages/tokens/tests/generate.test.ts`: replace the `placeholder`-token assertions with the category tokens — assert `:root` carries `--ds-type-*`, `--ds-space-*`, `--ds-color-*` base values; **every `--ds-color-*` value is a literal colour and the file contains no `--ds-palette-*` (`grep`-style count 0)**; the generated-file header; determinism; the empty-but-well-formed `:root {}` case including a fixture where one category is `{}` while others have tokens (analyze U1); and Swift base constants with sanitized identifiers.

**Checkpoint**: `pnpm --filter @design-system/tokens build && pnpm --filter @design-system/tokens test` green; `tokens.css` shows all category base values with resolved colours and no palette vars.

---

## Phase 4: User Story 2 — Override token values along nested conditional axes (Priority: P1)

**Goal**: A recursive override tree that resolves to the same finalized value
regardless of nesting order, with every authoring error rejected by name.

**Independent test**: Author one token nesting `dark` inside `768$` and a second
nesting `768$` inside `dark`; `resolveTokens` produces the identical
`ResolvedRule` (`{ colorMode: "dark", minWidth: 768 }`, same value, specificity 3) for both. Each rejection-matrix input fails the build naming the token and key.

- [x] T012 [US2] Create `packages/tokens/src/resolve.ts` with `parseAxisKey(key)` — classify a key as `colorMode` (`light`/`dark`), `mediaQuery` (`^[1-9][0-9]*\$$` → px `minWidth`), or `scope` (`^\.[a-z][a-z0-9-]*$` → name without dot), or throw a named error (`contracts/token-schema.md` R3–R6). `value` is reserved, never an axis key.
- [x] T013 [US2] In `packages/tokens/src/resolve.ts`, add `flattenToken(name, token)`: DFS over `overrides`, accumulate a `ConditionSet` (max one entry per axis), emit a rule at every node carrying a `value` (bare leaf = `{ value }` shorthand), and throw naming the token on missing base value (R1), an override node with neither `value` nor axis keys (R8), and two paths reducing to the same `ConditionSet` (R7).
- [x] T014 [US2] In `packages/tokens/src/resolve.ts`, add `specificity(conditions)` (weights color mode 1, media query 2, scope 4; summed — research D3), `compareRules` giving the total order (specificity, then `minWidth` asc, then color-mode order, then scope name, then token name — research D9), and `resolveTokens(tokens): ResolvedRule[]` returning all rules sorted. Colour leaves are already literal at this point (resolved in T008).
- [x] T015 [US2] Wire `resolvedTokens` (computed via `resolveTokens(tokens)`) and the `ResolvedRule` / `ConditionSet` type exports into `packages/tokens/src/index.ts` (FR-013); re-confirm no `palette` export.
- [x] T016 [P] [US2] Create `packages/tokens/tests/resolve.test.ts` — resolution behaviour: order-independence for the two-nesting-orders fixture pair, specificity tiers 0–7 in the documented order, multiple breakpoints on one token ordered by ascending `min-width`, bare-leaf `dark: "X"` equivalent to `dark: { value: "X" }`, and a `color.*` token resolving through `src/palette.ts` to a literal colour.
- [x] T017 [US2] Extend `packages/tokens/tests/resolve.test.ts` — rejection matrix: R1 (missing base value), R3 (unrecognised key), R4 (unknown color mode), R5 (malformed `$` breakpoint key), R6 (malformed `.scope` key), R7 (duplicate condition-set), R8 (empty override node), R10 (unknown palette key); each asserts the error message contains the token name and the offending key/ref. (Same file as T016 — run after it, not in parallel.)

**Checkpoint**: `pnpm --filter @design-system/tokens test` green; `resolvedTokens` importable with correct condition-sets, specificities, and literal colours.

---

## Phase 5: User Story 3 — Consume finalized tokens as ordered web output (Priority: P1)

**Goal**: `tokens.css` places every override into the correct CSS block in
ascending-specificity order so the cascade alone resolves each token; Storybook
demonstrates it.

**Independent test**: Build a token with base + `{dark}` + `{dark, .compact}`
overrides that disagree, load `tokens.css` in a browser, toggle
`data-theme="dark"` and `.ds-scope-compact`; the displayed value always matches
the most specific active condition, with no script running. Re-authoring the
overrides in a different nesting order yields a byte-identical file.

- [x] T018 [US3] Rewrite the CSS emission in `packages/tokens/src/generate.ts` to consume `resolveTokens`: map each `ConditionSet` to its wrapper per the table in `contracts/css-output.md`, fold `light` into the `:root` value (`overrides.light ?? value`), merge consecutive rules sharing an identical wrapper into one block, and emit blocks in `resolveTokens` order. Keep the generated-file header and the empty `:root {}` case.
- [x] T019 [US3] In `packages/tokens/src/generate.ts`, implement the scope + combination selectors: `.scope` → `.ds-scope-<name>`; combined wrappers as `@media (min-width: Npx) { [data-theme="dark"] .ds-scope-<name> { … } }` (media outermost, descendant combinator for color mode + scope) exactly per `contracts/css-output.md`.
- [x] T020 [P] [US3] Expand `packages/tokens/tests/generate.test.ts`: assert block ordering (color-mode block before media-query block before scope block; combination blocks after their single-axis parts); the exact wrapper form for each condition-set in the contract table; **a cascade-resolution assertion — walking the emitted blocks top-to-bottom, each block selector's CSS specificity tuple is non-decreasing, so source-order tie-breaking always yields the most specific match (research D13, analyze G1)**; a `type` token's `font` shorthand emitted verbatim including commas; no `--ds-palette-*` anywhere; byte-identical output for a fixture re-nested in a different order (FR-010/SC-003); and `:root {}` for an empty token set.
- [x] T021 [P] [US3] Rework `apps/docs/src/Tokens.stories.tsx`: one table per category (token name, base value, `var(--ds-…)` reference); an "Overrides" story with controls that toggle `data-theme="dark"` and a `.ds-scope-compact` wrapper class and display the live resolved value of the all-axes demo token; and a type sample applying `font: var(--ds-type-body)` to prove one declaration carries the whole style (SC-005; Constitution V: document every token group).
- [x] T022 [US3] Regenerate `apps/docs/src/__snapshots__/Tokens.stories.tsx.snap` and confirm `pnpm --filter docs build-storybook` and the Storybook test-runner (a11y + visual-regression) pass for the reworked Tokens stories.

**Checkpoint**: full feature works end to end; conflicting overrides resolve correctly in the browser.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T023 [P] In `specs/001-core-packages-scaffold/contracts/token-output.md`, add a supersession note on the `tokens — web output` section pointing at `specs/002-token-system-foundation/contracts/css-output.md`, and change its `.ds-feature-example` example to `.ds-scope-example` (analyze C1 / research D12).
- [x] T024 [P] Update `packages/tokens/README.md`: drop the "scaffolding only" language; document the category files, the `font` shorthand convention for `type`, the private palette + semantic colour model (palette never exported), the recursive override tree and its axis markers (`light`/`dark`, `NNN$`, `.scope`), `var(--ds-…)` consumption, and links to both contract docs.
- [x] T025 Run `pnpm build && pnpm test && pnpm lint && pnpm typecheck` from the repository root; resolve any cross-package fallout (docs typecheck, root vitest aggregate).
- [x] T026 Walk `specs/002-token-system-foundation/quickstart.md` end to end and confirm SC-001 through SC-007.

---

## Dependencies & Execution Order

- **Setup (T001)** → no dependencies.
- **Foundational (T002–T003)** → depends on Setup. **Blocks all user stories.**
- **User Story 1 (T004–T011)** → depends on Foundational. T004/T005/T006 parallel; T007 needs T004; T008 needs T004–T007; T009 needs T008; T010 independent of T007–T009 (edits a different part of `generate.ts`, but sequence after T008 to avoid churn); T011 after T009+T010.
- **User Story 2 (T012–T017)** → depends on Foundational; shares `src/index.ts` and `src/generate.ts` with US1, so run after US1. T012 → T013 → T014 → T015; T016 after T014; T017 after T016 (same file).
- **User Story 3 (T018–T022)** → depends on US2 (`resolveTokens`). T018 → T019; T020 after T019; T021 after T018; T022 after T021.
- **Polish (T023–T026)** → after all stories. T023/T024 parallel; T025 then T026 last.

## Parallel Opportunities

- **Setup**: T001 alone.
- **US1**: T004, T005, T006 together (three new files). T011 ∥ T010 once T009 lands.
- **US2**: none within the story — `resolve.ts` tasks are sequential and both test tasks touch one new file (T016 then T017).
- **US3**: T020 ∥ T021 (test file vs. stories file).
- **Polish**: T023 ∥ T024.

## Implementation Strategy

- **MVP = Phase 1 + Phase 2 + User Story 1**: real category files, a private
  palette, namespaced assembly, and a green build emitting all base values
  (colours resolved to literals, no palette vars) to `tokens.css` and Swift.
  Delivers the authoring format the whole system was blocked on.
- **Increment 2 = User Story 2**: the resolver — override trees flatten
  deterministically and every authoring mistake (including a bad palette ref) is
  caught by name.
- **Increment 3 = User Story 3**: the ordered CSS projection, the cascade-order
  proof, and the Storybook demo — the drop-in web artifact.
- **Then Polish**: contract cross-links + rename cleanup, README, full-repo gate
  run, quickstart walkthrough.
