# Implementation Plan: Core Packages Scaffold

**Branch**: `001-core-packages-scaffold` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-core-packages-scaffold/spec.md`

## Summary

Stand up a pnpm + Turborepo monorepo containing exactly three independently
versioned packages — `@design-system/tokens`, `@design-system/icons`,
`@design-system/components` — each with a generate/build step that succeeds with
only placeholder content, a web-consumable output (tokens emit CSS custom
properties), and generated Swift sources wired into a single repo-root
`Package.swift` exposing three SwiftPM products. A Storybook app under `apps/docs`
provides the local web dev/preview loop. The one-way dependency direction
(tokens → icons → components) is enforced by a custom check script in CI and
pre-build, not by convention. No real tokens, icons, or components are authored.

## Technical Context

**Language/Version**: TypeScript 5.6+ on Node.js 24 (constitution floor: Node 22+); Swift tools 5.9 for the iOS package manifest

**Primary Dependencies**: pnpm 9 (via Corepack) workspaces, Turborepo 2, Storybook 8 (`@storybook/react-vite`), React 18, Vitest 2, ESLint 9 (flat config), `tsx` for running generator scripts, `@storybook/test-runner` + `playwright` for CI visual-regression and accessibility gates

**Storage**: N/A — all outputs are generated files on disk under each package's `dist/`

**Testing**: Vitest per package (`test` script) + root aggregate; contract tests assert the tokens generator's emitted output (names, values, CSS block structure) per constitution Quality Gates; `@storybook/test-runner` (Playwright + `axe-playwright`) runs CI visual-regression snapshots and accessibility assertions over every Storybook story

**Target Platform**: Web (npm packages consumed by React/Storybook) primary; iOS (Phase 2) via SwiftPM local path dependency, stub Swift sources only

**Project Type**: Multi-package monorepo (3 library packages + 1 docs app + 1 root SwiftPM manifest)

**Performance Goals**: Clean checkout → all three packages built in < 5 min via `pnpm install && pnpm build` after a one-time `corepack enable` (SC-001); source change visible in Storybook in < 30 s from file save, dev server already running, warm cache (SC-003)

**Constraints**: No real design content (FR-010); builds succeed on empty/placeholder content (FR-005); `@design-system` scope used verbatim everywhere for a safe later find-and-replace (FR-001); no publish step anywhere in the local loop (FR-006, FR-007)

**Scale/Scope**: 3 packages, 1 docs app, ~1 placeholder artifact per package, 1 CI workflow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate for this feature | Status |
|---|-----------|-----------------------|--------|
| I | Tokens Are the Source of Truth | Placeholder token defined only in TypeScript; icons/components/CSS/Swift consume generated output, never hardcode. Each theme part in its own file (placeholder lives in `src/tokens/placeholder.ts`). | PASS |
| II | Generate, Do Not Fork | One shared TS source per package; web CSS/JS and iOS Swift are both projections of it. Root `Package.swift` consumes generated Swift; no parallel iOS source of truth. | PASS |
| III | Layered, Independently Shippable Packages | Exactly three packages; one-way deps enforced by `scripts/check-deps.mjs`; `apps/docs` is an app (consumer), not a grouping package; root `Package.swift` is generation output, not a 4th layer. | PASS |
| IV | Accessibility Is Non-Negotiable | `@storybook/addon-a11y` + `@storybook/test-runner` axe assertions run in CI (FR-011), gating the `Placeholder` component and every later component. | PASS |
| V | Tooling Enforces the Contract | `check-deps.mjs` (dependency matrix + no-4th-layer), typed public entry points, `tsc --noEmit` typecheck, contract tests on the tokens generator, CI runs all gates. `@storybook/test-runner` snapshot tests run in CI against the Storybook build, gating rendered-output changes from `Placeholder` onward (FR-011). | PASS |

**Technology Constraints check**: pnpm + Turborepo ✓ · custom TS token schema + custom TS generator (no DTCG/Style Dictionary) ✓ · TS + React + Storybook for web ✓ · SwiftPM for iOS ✓ · Node 22+ ✓

**Result (pre-Phase 0)**: No violations. Complexity Tracking not required.

**Re-check (post-Phase 1 design)**: Design artifacts introduce no new packages,
no new variant axes, and no speculative layers. `apps/docs` and root
`Package.swift` remain consumers/outputs, not layers. All five principles still
PASS; gate holds.

## Project Structure

### Documentation (this feature)

```text
specs/001-core-packages-scaffold/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── build-commands.md
│   ├── package-manifest.md
│   ├── dependency-matrix.md
│   └── token-output.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
design-system/
├── package.json                 # workspace root; scripts delegate to turbo
├── pnpm-workspace.yaml           # packages/*, apps/*
├── turbo.json                    # build/generate/test/lint pipeline, ^build ordering
├── tsconfig.base.json            # shared compiler options
├── eslint.config.js             # flat config, incl. import-boundary rule (secondary)
├── vitest.workspace.ts          # aggregates per-package vitest projects
├── Package.swift                # committed manifest: 3 products/targets, paths into packages/*/dist/ios
├── .github/workflows/ci.yml     # install → build → test → check-deps → lint → build-storybook → test-storybook (a11y + VR)
├── scripts/
│   ├── check-deps.mjs           # PRIMARY FR-003 enforcement: dependency matrix + reject 4th packages/* layer
│   └── toggle-agent.js          # (existing)
├── packages/
│   ├── tokens/
│   │   ├── package.json          # name: @design-system/tokens
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts          # public entry: token values + types (JS consumers)
│   │   │   ├── types.ts          # custom TS token schema
│   │   │   ├── tokens/
│   │   │   │   ├── index.ts
│   │   │   │   └── placeholder.ts # ONE placeholder token, own file (Principle I)
│   │   │   └── generate.ts       # custom generator → dist/web + dist/ios
│   │   ├── tests/                 # generator contract tests (Vitest)
│   │   └── dist/                  # gitignored
│   │       ├── web/{index.js,index.d.ts,tokens.css}
│   │       └── ios/DesignSystemTokens/*.swift
│   ├── icons/
│   │   ├── package.json          # name: @design-system/icons; deps: @design-system/tokens (allowed)
│   │   ├── src/{index.ts,svg/placeholder.svg,generate.ts}
│   │   ├── tests/
│   │   └── dist/{web/,ios/DesignSystemIcons/}
│   └── components/
│       ├── package.json          # name: @design-system/components; deps: tokens + icons (allowed)
│       ├── src/{index.ts,Placeholder.tsx,generate.ts}
│       ├── tests/
│       └── dist/{web/,ios/DesignSystemComponents/}
└── apps/
    └── docs/                     # Storybook — the local web dev/preview env (NOT a package)
        ├── package.json          # private, unversioned
        ├── .storybook/{main.ts,preview.ts,test-runner.ts}
        ├── src/__snapshots__/    # committed visual-regression baselines
        └── src/*.stories.tsx     # one placeholder story per package
```

**Structure Decision**: Multi-package monorepo. `packages/*` holds the three
shippable libraries; `apps/docs` is the Storybook consumer that satisfies FR-009
and is explicitly not counted as a package. iOS output is a single committed
`Package.swift` at the repo root whose target `path`s point at
`packages/<layer>/dist/ios/DesignSystem<Layer>/`; the Swift sources there are
generated by each package's `generate.ts` and are gitignored, so `swift package`
resolution succeeds only after `pnpm build` (per FR-007/SC-005).
`scripts/check-deps.mjs` is the canonical FR-003 control; an ESLint
import-boundary rule is a secondary guard. FR-011's visual-regression and
accessibility gates run in CI via `@storybook/test-runner` against the built
Storybook.

## Complexity Tracking

> No Constitution Check violations. Section intentionally empty.
