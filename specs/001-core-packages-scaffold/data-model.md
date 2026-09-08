# Phase 1 Data Model: Core Packages Scaffold

This feature has no runtime data store. The "entities" are the structural units
of the monorepo and the files each build step emits. Validation rules trace to
functional requirements.

## Entity: Package

One of the three foundational libraries.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Exactly `@design-system/tokens` \| `@design-system/icons` \| `@design-system/components` (FR-001) |
| `version` | semver string | Independent per package (FR-002); starts at `0.0.0` |
| `sourceDir` | path | `packages/<layer>/src/` — the single shared origin (Principle II) |
| `publicEntry` | path | `dist/web/index.js` + `dist/web/index.d.ts`, declared via `exports` / `types` in `package.json` (FR-002) |
| `webOutput` | GeneratedOutput | platform = `web` (FR-006) |
| `iosOutput` | GeneratedOutput | platform = `ios`, may be a stub (FR-007) |
| `internalDeps` | `@design-system/*`[] | Must satisfy the Dependency Matrix (FR-003) |
| `buildScript` | string | `package.json` `scripts.build`; runnable from clean checkout after install (FR-004) |
| `testScript` | string | `package.json` `scripts.test`; independently runnable (SC-002) |

**Validation rules**

- `packages/` contains exactly the three allowed directories — no more (edge
  case: reject 4th layer). Enforced by `scripts/check-deps.mjs`.
- `internalDeps` ⊆ allowed set for that package (see matrix). Violation →
  non-zero exit, error names the offending package (SC-004).
- `buildScript` exits 0 when `src/` has only placeholder content (FR-005).
- `name` scope is the literal string `@design-system` everywhere (FR-001).

**Relationships**

```
tokens  ──depended-on-by──▶  icons
tokens  ──depended-on-by──▶  components
icons   ──depended-on-by──▶  components
```

Direction is one-way and acyclic (Principle III). `tokens.internalDeps == []`.

## Entity: GeneratedOutput

Build artifacts produced by a package's generate/build step for one platform.
Derived entirely from `sourceDir`; never hand-edited; lives under `dist/`
(gitignored).

| Field | Type | Notes |
|-------|------|-------|
| `platform` | `web` \| `ios` | |
| `producedBy` | Package | the owning package |
| `location` | path | `dist/web/` or `dist/ios/DesignSystem<Layer>/` |
| `files` | file[] | see per-platform contract in `contracts/token-output.md` |
| `wellFormedWhenEmpty` | boolean | MUST be true — valid output even with no real content (FR-005) |

**Web output (all packages)**: `index.js`, `index.d.ts`. Tokens additionally
emits `tokens.css` (CSS custom properties, scoped selector blocks — FR-006a).

**iOS output (all packages)**: one or more `.swift` files under
`DesignSystem<Layer>/`, referenced by a target in the root `Package.swift`.
Stub-level for this feature (namespace enum +, for tokens, placeholder
constants).

**Validation rules**

- Regenerating from unchanged source produces byte-identical output
  (reproducibility, Principle V).
- Changing an upstream package's source and rebuilding refreshes this output —
  no stale artifacts (FR-008).
- No generated file introduces a value not present in source (Principle I/II).

## Entity: Local Dev Environment

The Storybook app through which a web engineer observes package output.

| Field | Type | Notes |
|-------|------|-------|
| `path` | path | `apps/docs/` |
| `kind` | `app` | NOT a package; private, unversioned (Principle III) |
| `consumes` | Package[] | all three, via their `dist/web` output |
| `stories` | file[] | `src/*.stories.tsx` — ≥ one placeholder story per package |
| `reflectsChangeWithin` | duration | < 30 s from file save, dev server running, warm cache (SC-003) |
| `a11yGate` | CI step | `@storybook/addon-a11y` + `@storybook/test-runner` axe assertions, run in CI (FR-011, Principle IV) |
| `vrGate` | CI step | `@storybook/test-runner` DOM snapshots vs. `apps/docs/src/__snapshots__/` baselines, run in CI (FR-011, Principle V) |

**Validation rules**

- A source edit in any of the three packages is visible after `turbo watch`
  rebuild without a publish/install step (FR-006, SC-003).
- Every public token group / component that exists has a story before its API is
  "complete" (Principle V) — for this feature that means the placeholders.
- CI fails on any `axe` violation or snapshot diff in a story (FR-011).

## Entity: Root SwiftPM Manifest

`Package.swift` at the repository root — a committed manifest (not a design
value).

| Field | Type | Notes |
|-------|------|-------|
| `products` | 3 × library | `DesignSystemTokens`, `DesignSystemIcons`, `DesignSystemComponents` |
| `targets` | 3 | `path` → `packages/<layer>/dist/ios/DesignSystem<Layer>` |
| `targetDeps` | graph | Icons→[Tokens]; Components→[Tokens, Icons]; Tokens→[] |
| `swiftToolsVersion` | `5.9` | |

**Validation rules**

- `swift package describe` resolves after `pnpm build`, with no network fetch and
  no publish (SC-005, FR-007).
- `targetDeps` mirror the Dependency Matrix exactly.
