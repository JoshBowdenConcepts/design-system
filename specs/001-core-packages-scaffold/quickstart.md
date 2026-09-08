# Quickstart: Core Packages Scaffold — Validation Guide

Runnable scenarios that prove the scaffold satisfies the spec. Details of
outputs and rules live in [contracts/](./contracts/) and
[data-model.md](./data-model.md).

## Prerequisites

- Node.js ≥ 22 (CI runs 24)
- Corepack enabled: `corepack enable` (one-time; provides the repo-pinned pnpm 9
  — pnpm is not assumed to be globally installed)
- For Scenario 6 (iOS) only: a Swift toolchain (`swift --version`, tools ≥ 5.9)
- For Scenario 8 (a11y + VR) only: Playwright browsers (`npx playwright install chromium`)

## Setup (SC-001 — one-time `corepack enable`, then two commands)

```bash
corepack enable        # one-time environment step
pnpm install
pnpm build
```

## Scenario 1 — Three packages build from a clean checkout (US1)

```bash
pnpm build
```

Expect:
- Exit 0, no errors, in well under 5 minutes.
- `packages/tokens/dist/web/{index.js,index.d.ts,tokens.css}` exist.
- `packages/icons/dist/web/` and `packages/components/dist/web/` exist.
- Build order in Turborepo output is tokens → icons → components.
- `packages/*/dist/ios/DesignSystem*/*.swift` exist.

Structure check (US1 scenario 2):

```bash
node scripts/check-deps.mjs   # -> "dependency matrix OK (3 packages)"
cat packages/*/package.json | grep '"name"'   # all @design-system/*
```

## Scenario 2 — One-way dependency direction is enforced (US1 sc. 3 / SC-004)

```bash
# tokens resolves as a dependency of icons & components (happy path)
pnpm --filter @design-system/icons run build
pnpm --filter @design-system/components run build   # both succeed

# introduce a violation, expect failure BEFORE review
pnpm --filter @design-system/tokens add @design-system/icons  # or hand-edit its package.json
node scripts/check-deps.mjs
#   -> non-zero exit
#   -> "packages/tokens depends on @design-system/icons, which violates the
#       one-way dependency direction (tokens -> icons -> components)."
git checkout -- packages/tokens/package.json   # revert
```

Also verify no 4th layer:

```bash
mkdir packages/motion && echo '{}' > packages/motion/package.json
node scripts/check-deps.mjs   # -> fails: 'Unexpected package "packages/motion"'
rm -rf packages/motion
```

## Scenario 3 — Empty/placeholder content still builds (Edge case / FR-005)

```bash
# temporarily strip placeholder content, then build
pnpm --filter @design-system/tokens run build
# -> still exit 0; dist/web/tokens.css present with a (possibly empty) :root block
```

## Scenario 4 — Local web dev loop (US2 / SC-003)

```bash
pnpm dev          # turbo watch + Storybook on http://localhost:6006
```

- Storybook shows one placeholder story per package.
- Edit `packages/tokens/src/tokens/placeholder.ts` (change the value).
- Within ~30 s the rebuilt value is reflected in the token story and in the
  `Placeholder` component story (which consumes `var(--ds-placeholder)`), with no
  publish or `pnpm install`.

## Scenario 5 — Dependents rebuild when upstream changes (FR-008)

```bash
pnpm build                                   # everything cached
touch packages/tokens/src/tokens/placeholder.ts
pnpm build                                   # tokens rebuilds AND icons + components rebuild
```

Confirm Turborepo does not report `components` as a full cache hit.

## Scenario 6 — Local iOS path dependency resolves (US3 / SC-005)

```bash
pnpm build                    # generates packages/*/dist/ios/**
swift package describe        # at repo root -> lists 3 products, no network fetch
```

From a separate throwaway Swift package:

```swift
// Package.swift
dependencies: [ .package(path: "../design-system") ],
targets: [ .target(name: "App", dependencies: [
    .product(name: "DesignSystemTokens", package: "design-system")
]) ]
```

```bash
swift build   # resolves and compiles against the local path, nothing published
```

## Scenario 8 — Accessibility + visual-regression gate (US2 / FR-011)

```bash
pnpm build
pnpm --filter docs build-storybook
npx playwright install --with-deps chromium
pnpm --filter docs test-storybook --url http://127.0.0.1:6006   # served from storybook-static
```

Expect:
- Every story passes `axe` accessibility checks (WCAG 2.2 AA).
- Every story's DOM snapshot matches the committed baseline under
  `apps/docs/src/__snapshots__/`.
- Introduce a low-contrast colour or a broken ARIA attribute in a story →
  `test-storybook` exits non-zero.

## Scenario 7 — Full gate (CI parity)

```bash
pnpm install --frozen-lockfile
pnpm build && pnpm test && node scripts/check-deps.mjs && pnpm lint \
  && pnpm --filter docs build-storybook \
  && pnpm --filter docs test-storybook --url http://127.0.0.1:6006
```

All succeed → scaffold is ready for implementation.
