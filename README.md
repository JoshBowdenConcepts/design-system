# Design System

A pnpm + Turborepo monorepo with three independently versioned packages —
`@design-system/tokens`, `@design-system/icons`, `@design-system/components` —
each generating both a web output (CSS custom properties + typed JS) and iOS
Swift sources.

> **Status:** scaffolding only. No real design tokens, icons, or components are
> authored yet — just the structural packages, the build pipeline, and one
> clearly-labelled placeholder per package to prove the pipeline works.

## Getting started

```bash
corepack enable          # one-time: activates the repo-pinned pnpm
pnpm install
pnpm build
```

Requires **Node.js 22+** (CI runs Node 24).

## Commands

| Command | What it does |
|---------|--------------|
| `pnpm build` | Builds all packages in dependency order (`tokens → icons → components`), producing `dist/web/**` and `dist/ios/**` for each. |
| `pnpm dev` | `turbo watch` + Storybook on <http://localhost:6006>. Source changes propagate to Storybook after rebuild, no publish. |
| `pnpm test` | Runs every package's Vitest project. |
| `pnpm lint` | ESLint (flat config) across the workspace. |
| `pnpm typecheck` | `tsc --noEmit` per package. |
| `pnpm check:deps` | Enforces the one-way dependency matrix (see below). |
| `pnpm --filter docs build-storybook` | Builds the static Storybook. |
| `pnpm --filter docs test-storybook` | Accessibility (`axe`) + visual-regression snapshot gate over every story. |

Per-package: `pnpm --filter @design-system/<layer> run <script>`.

## Dependency direction

One-way only. Enforced by `scripts/check-deps.mjs` (in CI and via
`pnpm check:deps`) and, as a secondary guard, by an ESLint import-boundary rule.

| Package | May depend on |
|---------|---------------|
| `@design-system/tokens` | — (nothing) |
| `@design-system/icons` | `tokens` |
| `@design-system/components` | `tokens`, `icons` |

Adding a fourth package under `packages/`, or a reverse dependency, fails the
check.

## iOS

A single `Package.swift` at the repo root exposes `DesignSystemTokens`,
`DesignSystemIcons`, and `DesignSystemComponents` as SwiftPM products. The Swift
sources are generated under `packages/<layer>/dist/ios/` (gitignored), so
`swift package` resolution works **after `pnpm build`**. Consume it locally:

```swift
// Package.swift
dependencies: [ .package(path: "../design-system") ],
targets: [
  .target(name: "App", dependencies: [
    .product(name: "DesignSystemTokens", package: "design-system"),
  ]),
]
```

## Renaming the `@design-system` scope

`@design-system` is a placeholder. To rename it later, find-and-replace the
string `@design-system` across: every `packages/*/package.json` and
`apps/*/package.json`, all `src/**` imports, `.storybook/**`, and this README.
No other files reference it.

## Layout

```
packages/{tokens,icons,components}/   # the three shippable libraries
apps/docs/                            # Storybook (dev/preview + a11y/VR gate) — not a package
scripts/check-deps.mjs                # dependency-matrix enforcement
Package.swift                         # generated SwiftPM manifest (3 products)
```
