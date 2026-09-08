---
description: "Task list for Core Packages Scaffold"
---

# Tasks: Core Packages Scaffold

**Input**: Design documents from `/specs/001-core-packages-scaffold/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Contract/build tests ARE included — SC-002 mandates an independently runnable test step per package, the constitution's Quality Gates require contract tests on the tokens generator's emitted output, and FR-011 requires CI accessibility + visual-regression gates over Storybook. They are not optional for this feature.

**Organization**: Tasks are grouped by user story. US1 is the MVP; US2 and US3 build on the packages US1 creates.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1 / US2 / US3 (Setup, Foundational, Polish carry no story label)
- All paths are repo-root-relative.

## Path Conventions

Multi-package monorepo (per plan.md): `packages/{tokens,icons,components}/`, `apps/docs/`, `scripts/`, repo-root `Package.swift`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Workspace skeleton and shared tooling configuration.

- [x] T001 Create the monorepo directory skeleton: `packages/tokens/src/tokens/`, `packages/tokens/tests/`, `packages/icons/src/svg/`, `packages/icons/tests/`, `packages/components/src/`, `packages/components/tests/`, `apps/docs/.storybook/`, `apps/docs/src/`, `scripts/`, `.github/workflows/`
- [x] T002 Write root `package.json`: `private: true`, `packageManager: "pnpm@9.x"`, `engines.node: ">=22"`, and `scripts` `build`/`dev`/`test`/`lint`/`typecheck`/`check:deps` each delegating to `turbo` (or `node scripts/check-deps.mjs` for `check:deps`), per [contracts/build-commands.md](./contracts/build-commands.md). Preserve the existing `agent:*` / `toggle` scripts.
- [x] T002a Add root `devDependencies`: `turbo`, `vitest`, `typescript`, `tsx`, `eslint`, `typescript-eslint`, `eslint-plugin-import`, `eslint-import-resolver-typescript`, `@types/node`, `@types/react`, `@types/react-dom`; run `pnpm install` to generate `pnpm-lock.yaml`
- [x] T003 [P] Write `pnpm-workspace.yaml` globbing `packages/*` and `apps/*`
- [x] T004 [P] Write `tsconfig.base.json` with shared compiler options (ESNext modules, `bundler` resolution, `strict`, `declaration`, `jsx: react-jsx`)
- [x] T005 [P] Write `turbo.json` with the `build` (`dependsOn: ["^build"]`, `outputs: ["dist/**"]`), `test` (`dependsOn: ["build"]`), `lint`, and `typecheck` (`dependsOn: ["^build"]`) tasks, per [contracts/build-commands.md](./contracts/build-commands.md)
- [x] T006 [P] Write `eslint.config.js` (flat config) including an `import/no-restricted-paths` (or `no-restricted-imports`) rule encoding the one-way boundaries from [contracts/dependency-matrix.md](./contracts/dependency-matrix.md) as the secondary guard
- [x] T007 [P] Write `vitest.workspace.ts` aggregating `packages/*/tests/` as projects
- [x] T008 [P] Update root `.gitignore` to confirm `dist/`, `.turbo/`, `storybook-static/`, `*.tsbuildinfo` are ignored (the generated Swift lives under `packages/*/dist/ios/` and is covered by `dist/`)
- [x] T009 [P] Write root `README.md` with the documented path — one-time `corepack enable`, then the two commands `pnpm install` and `pnpm build` (SC-001) — and a stub section for the command reference

**Checkpoint**: `pnpm install` succeeds on the empty workspace.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The dependency-direction control and CI, which every later phase relies on.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [x] T010 Implement `scripts/check-deps.mjs` (Node, zero dependencies): reads every `packages/*/package.json`; fails if any `packages/*` dir is outside {tokens, icons, components}; validates each `name` === `@design-system/<dir>`; validates every `@design-system/*` entry in `dependencies`/`peerDependencies`/`devDependencies` against the allowed matrix; prints the offending package + reason and exits non-zero on violation; prints `dependency matrix OK (3 packages)` and exits 0 otherwise. Follow [contracts/dependency-matrix.md](./contracts/dependency-matrix.md).
- [x] T011 [P] Write `scripts/check-deps.test.mjs` (Vitest) asserting: clean workspace passes; a wrong-direction dep fails with a message naming the package; an extra `packages/<x>` dir fails; a mismatched `name` fails
- [x] T012 Write `.github/workflows/ci.yml`: on push/PR → `corepack enable` → `pnpm install --frozen-lockfile` → `pnpm build` → `pnpm test` → `node scripts/check-deps.mjs` → `pnpm lint`, on Node 24. (The Storybook a11y + visual-regression steps are appended in T044d once `apps/docs` exists.)

**Checkpoint**: `pnpm check:deps` and CI run green against the empty `packages/` tree.

---

## Phase 3: User Story 1 - Stand up the three foundational packages (Priority: P1) 🎯 MVP

**Goal**: `packages/{tokens,icons,components}` each have a manifest, a public entry point, and a build step that produces web + iOS output and succeeds on placeholder-only content, with the one-way dependency resolved end to end.

**Independent Test**: From a clean checkout, `pnpm install && pnpm build` produces `dist/web/**` and `dist/ios/**` for all three packages with no errors; `node scripts/check-deps.mjs` passes; icons and components resolve `@design-system/tokens`. (quickstart Scenarios 1–3.)

### Tokens package

- [x] T013 [P] [US1] `packages/tokens/package.json` — `name: "@design-system/tokens"`, `type: module`, `version: 0.0.0`, `exports` (`.` + `./tokens.css`), `types`, `files: ["dist/web","dist/ios"]`, `sideEffects: ["*.css"]`, scripts `build`/`generate`/`test`/`lint`/`typecheck`. Per [contracts/package-manifest.md](./contracts/package-manifest.md).
- [x] T014 [P] [US1] `packages/tokens/tsconfig.json` extending `../../tsconfig.base.json`
- [x] T015 [P] [US1] `packages/tokens/src/types.ts` — the custom TypeScript token schema (token value types + the axis-aware shape), per [contracts/token-output.md](./contracts/token-output.md)
- [x] T016 [US1] `packages/tokens/src/tokens/placeholder.ts` — one token named `placeholder` (value `0`) in its own file, deliberately not a real scale value; `packages/tokens/src/tokens/index.ts` barrel (depends on T015)
- [x] T017 [US1] `packages/tokens/src/index.ts` — public entry re-exporting the token values `as const` and the schema types (depends on T016)
- [x] T018 [US1] `packages/tokens/src/generate.ts` — the custom generator: emits `dist/web/tokens.css` (CSS custom properties in scoped `:root` / `@media` / `[data-theme="dark"]` / `.ds-feature-*` blocks, all `--ds-` prefixed), `dist/web/index.js` + `index.d.ts`, and `dist/ios/DesignSystemTokens/Tokens.swift` (namespace enum + placeholder constant mirroring the web value). Empty-but-well-formed when source is empty. Idempotent/byte-identical on unchanged input. Per [contracts/token-output.md](./contracts/token-output.md). (depends on T017)
- [x] T019 [US1] Set `packages/tokens/package.json` `build` = `tsx src/generate.ts`, `generate` = same, `typecheck` = `tsc --noEmit -p tsconfig.json` (depends on T018)
- [x] T020 [P] [US1] `packages/tokens/tests/generate.test.ts` (Vitest) — asserts: `--ds-placeholder` present in `:root`; value matches source; each axis block is emitted (may be empty); JS export tree matches; empty-source run still writes a valid `tokens.css` with `:root {}` and exits 0. Satisfies the constitution Quality Gate. (depends on T018)

### Icons package

- [x] T021 [P] [US1] `packages/icons/package.json` — `name: "@design-system/icons"`, `dependencies: { "@design-system/tokens": "workspace:*" }`, `peerDependencies: { react }`, scripts as in [contracts/package-manifest.md](./contracts/package-manifest.md)
- [x] T022 [P] [US1] `packages/icons/tsconfig.json` extending the base config
- [x] T023 [P] [US1] `packages/icons/src/svg/placeholder.svg` — a single-path square, clearly a placeholder
- [x] T024 [US1] `packages/icons/src/generate.ts` — transforms `src/svg/*.svg` into typed React components (colour via `var(--ds-…)`, never hardcoded) and writes `dist/ios/DesignSystemIcons/Icons.swift` (empty namespace enum stub). Empty-but-well-formed on no SVGs. (depends on T023)
- [x] T025 [US1] `packages/icons/src/index.ts` — barrel exporting `PlaceholderIcon` (depends on T024)
- [x] T026 [US1] Set `packages/icons/package.json` `build` = `tsx src/generate.ts && tsc`, `generate`/`typecheck` scripts (depends on T024, T025)
- [x] T027 [P] [US1] `packages/icons/tests/generate.test.ts` — asserts `PlaceholderIcon` is generated and typed; no hardcoded hex in output; empty-source run exits 0 with an empty barrel (depends on T024)

### Components package

- [x] T028 [P] [US1] `packages/components/package.json` — `name: "@design-system/components"`, `dependencies: { "@design-system/tokens": "workspace:*", "@design-system/icons": "workspace:*" }`, `peerDependencies: { react, react-dom }`, scripts per contract
- [x] T029 [P] [US1] `packages/components/tsconfig.json` extending the base config
- [x] T030 [US1] `packages/components/src/Placeholder.tsx` — a `<div>` whose style consumes `var(--ds-placeholder)`, proving the tokens→components consumption path; no hardcoded design values
- [x] T031 [US1] `packages/components/src/generate.ts` — writes `dist/ios/DesignSystemComponents/Components.swift` (empty namespace enum stub)
- [x] T032 [US1] `packages/components/src/index.ts` — barrel exporting `Placeholder` (depends on T030)
- [x] T033 [US1] Set `packages/components/package.json` `build` = `tsx src/generate.ts && tsc`, `generate`/`typecheck` scripts (depends on T030, T031, T032)
- [x] T034 [P] [US1] `packages/components/tests/build.test.ts` — asserts `Placeholder` compiles, references `--ds-placeholder`, contains no hardcoded design literals (depends on T030)

### US1 integration

- [x] T035 [US1] Run `pnpm build` from a clean state (root devDeps already added in T002a) and confirm Turborepo order is tokens → icons → components and every `dist/web/**` + `dist/ios/**` is produced (depends on T019, T026, T033)
- [x] T036 [US1] Run quickstart Scenarios 1–3: structure check, one-way dependency happy path, a deliberate violation caught by `check-deps.mjs`, and an empty-content rebuild. Fix any gaps. (depends on T035)

**Checkpoint**: MVP — the three packages build and the dependency contract holds. Deployable/demoable.

---

## Phase 4: User Story 2 - Local web development loop (Priority: P2)

**Goal**: A Storybook app under `apps/docs` renders a placeholder story per package from built web output, a package source change is reflected after a `turbo watch` rebuild with no publish/install, and CI gates accessibility + visual regression over those stories (FR-011).

**Independent Test**: `pnpm dev` starts Storybook; editing `packages/tokens/src/tokens/placeholder.ts` changes the token and component stories within ~30 s, no publish; `pnpm --filter docs test-storybook` passes (a11y + VR snapshots green for `Placeholder`). (quickstart Scenarios 4–5, 8.)

**Depends on**: US1 (needs the three built packages).

- [x] T037 [P] [US2] `apps/docs/package.json` — `private: true`, deps `@storybook/react-vite`, `storybook`, `@storybook/addon-a11y`, `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, and `@design-system/{tokens,icons,components}: "workspace:*"`; `scripts.storybook` = `storybook dev -p 6006`
- [x] T038 [P] [US2] `apps/docs/.storybook/main.ts` — framework `@storybook/react-vite`, `stories: ["../src/**/*.stories.tsx"]`, addons include `@storybook/addon-a11y`
- [x] T039 [P] [US2] `apps/docs/.storybook/preview.ts` — import `@design-system/tokens/tokens.css`; set a themed background
- [x] T040 [P] [US2] `apps/docs/tsconfig.json` extending the base config
- [x] T041 [US2] `apps/docs/src/Tokens.stories.tsx` — a placeholder story displaying the placeholder token via its CSS custom property (depends on T039)
- [x] T042 [P] [US2] `apps/docs/src/Icons.stories.tsx` — renders `PlaceholderIcon`
- [x] T043 [P] [US2] `apps/docs/src/Components.stories.tsx` — renders `Placeholder`
- [x] T044 [US2] Set root `package.json` `dev` = `turbo watch build --parallel` alongside `pnpm --filter docs storybook` (via `turbo`/`concurrently`); add a `dev`/`storybook` task to `turbo.json` as needed (depends on T037)
- [x] T044a [P] [US2] Add to `apps/docs` devDeps `@storybook/test-runner`, `playwright`, `axe-playwright`, `http-server`, `wait-on`, `concurrently`; add `apps/docs` scripts `build-storybook` = `storybook build` and `test-storybook` = `test-storybook` (depends on T037)
- [x] T044b [US2] Write `apps/docs/.storybook/test-runner.ts` — a `postVisit` hook running `axe-playwright` against every story configured for WCAG 2.2 AA, failing on any violation (FR-011, Constitution IV) (depends on T044a)
- [x] T044c [US2] Enable `@storybook/test-runner` DOM snapshot per story; generate and commit baselines under `apps/docs/src/__snapshots__/` (FR-011 visual-regression gate, Constitution V) (depends on T044a, T041, T042, T043)
- [x] T044d [US2] Extend `.github/workflows/ci.yml` (T012): after `pnpm lint` → `pnpm --filter docs build-storybook` → `npx playwright install --with-deps chromium` → serve `apps/docs/storybook-static` and run `pnpm --filter docs test-storybook --url http://127.0.0.1:6006` (via `concurrently` + `wait-on`) (depends on T044b, T044c)
- [x] T045 [US2] Run quickstart Scenarios 4–5 and 8: change a token, observe it in Storybook < 30 s (per the SC-003 baseline); `touch` a tokens source file and confirm `components` is not a full Turborepo cache hit (FR-008); `pnpm --filter docs test-storybook` passes a11y + VR (depends on T044, T044d, T041, T042, T043)

**Checkpoint**: Web dev loop works; US1 + US2 both independently testable.

---

## Phase 5: User Story 3 - Local iOS development loop (Priority: P3)

**Goal**: A single repo-root `Package.swift` exposes tokens/icons/components as three SwiftPM products whose target deps mirror the one-way matrix; a local Swift consumer resolves and builds against it with no publish/network fetch after a workspace build.

**Independent Test**: `pnpm build` then `swift package describe` lists three products; a throwaway `.package(path: "../design-system")` consumer runs `swift build` successfully. (quickstart Scenario 6.)

**Depends on**: US1 (each `generate.ts` must already write Swift into `dist/ios/`).

- [x] T046 [US3] Write repo-root `Package.swift` — `swift-tools-version:5.9`; three library products `DesignSystemTokens`/`DesignSystemIcons`/`DesignSystemComponents`; targets with `path` → `packages/<layer>/dist/ios/DesignSystem<Layer>`; target deps: Icons→[Tokens], Components→[Tokens, Icons], Tokens→[]. Per [contracts/token-output.md](./contracts/token-output.md) and [contracts/dependency-matrix.md](./contracts/dependency-matrix.md).
- [x] T047 [US3] Confirm/adjust each package's `generate.ts` (T018, T024, T031) so the emitted Swift file names and namespace enums match the target `path`s in `Package.swift`; tokens' Swift constant value must equal the web token value (same source)
- [x] T048 [US3] Document in `README.md` that `Package.swift` resolves only after `pnpm build` (generated Swift is under gitignored `dist/`), plus the iOS consumer `.package(path:)` + `.product(name:)` snippet
- [x] T049 [US3] Run quickstart Scenario 6: `pnpm build` → `swift package describe` (no network fetch) → throwaway consumer `swift build` against the local path (depends on T046, T047)

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and guard-rails that span the packages.

- [x] T050 [P] Flesh out root `README.md`: full command reference, the dependency matrix, the Node version, and the `@design-system` scope-rename note (enumerate the file classes that hold the scope, per FR-001 / checklist CHK010)
- [x] T051 [P] Add `packages/tokens/README.md`, `packages/icons/README.md`, `packages/components/README.md` each documenting the public entry point and build/test commands (FR-002 / checklist CHK006)
- [x] T052 [P] Add a short `CONTRIBUTING.md` (or README section) defining the placeholder-vs-real-content boundary and that generated files are never hand-edited (FR-010 / checklist CHK018, CHK047)
- [x] T053 [P] Verify the ESLint `import/no-restricted-paths` rule (T006) actually fails on a planted cross-boundary import, then remove the plant
- [x] T054 Run the full quickstart Scenario 7 (CI parity) locally: `pnpm install --frozen-lockfile && pnpm build && pnpm test && node scripts/check-deps.mjs && pnpm lint && pnpm --filter docs build-storybook && pnpm --filter docs test-storybook --url http://127.0.0.1:6006`

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: no dependencies — start immediately
- **Foundational (Phase 2)**: after Setup — BLOCKS all user stories
- **US1 (Phase 3)**: after Foundational — the MVP
- **US2 (Phase 4)**: after US1 (consumes built packages)
- **US3 (Phase 5)**: after US1 (consumes generated Swift from each package's build)
- **Polish (Phase 6)**: after US1–US3

### User story dependencies

- **US1 (P1)**: independent once Foundational is done
- **US2 (P2)**: needs US1's built `dist/web/**`; otherwise independently testable
- **US3 (P3)**: needs US1's `generate.ts` scripts writing `dist/ios/**`; otherwise independently testable
- US2 and US3 do not depend on each other and may be done in either order or in parallel

### Within US1

- Manifests + tsconfigs (T013–T014, T021–T022, T028–T029) are all [P]
- Per package: schema/source → generator → wire build script → test
- Cross-package build order (tokens→icons→components) is enforced at runtime by Turborepo `^build`, not by task order

### Parallel opportunities

- Setup: T003–T009 all [P]
- Foundational: T011 [P] alongside T010/T012
- US1: T013, T014, T015, T021, T022, T023, T028, T029 in parallel; then the three generators (T018, T024, T031) largely in parallel; then the three test files (T020, T027, T034) in parallel
- US2: T037–T040 [P]; T042, T043 [P]; T044a [P]
- Polish: T050–T053 all [P]

### Within US2

- Stories (T041–T043) before the VR snapshot baseline (T044c)
- `test-runner.ts` a11y hook (T044b) and snapshot baseline (T044c) before the CI wiring (T044d)

---

## Parallel Example: User Story 1 kickoff

```bash
# Manifests + tsconfigs for all three packages at once:
Task: "T013 packages/tokens/package.json"
Task: "T014 packages/tokens/tsconfig.json"
Task: "T021 packages/icons/package.json"
Task: "T022 packages/icons/tsconfig.json"
Task: "T028 packages/components/package.json"
Task: "T029 packages/components/tsconfig.json"

# Later, the three contract/build test files together:
Task: "T020 packages/tokens/tests/generate.test.ts"
Task: "T027 packages/icons/tests/generate.test.ts"
Task: "T034 packages/components/tests/build.test.ts"
```

---

## Implementation Strategy

### MVP first (US1 only)

1. Phase 1: Setup
2. Phase 2: Foundational (dependency control + CI)
3. Phase 3: US1 — three packages build, contract holds
4. **STOP and VALIDATE** against quickstart Scenarios 1–3
5. Demo the scaffold

### Incremental delivery

1. Setup + Foundational → foundation ready
2. US1 → validate → demo (MVP)
3. US2 → validate web dev loop + a11y/VR CI gates → demo
4. US3 → validate local iOS path → demo
5. Polish → docs and guard-rails

### Notes

- `[P]` = different files, no incomplete dependency
- Contract tests + the Storybook a11y/VR gates are required (SC-002, FR-011, constitution), not optional
- Commit after each task or logical group
- No real tokens/icons/components — placeholder only (FR-010)
- 59 tasks total (T001–T054 plus T002a and T044a–T044d)
