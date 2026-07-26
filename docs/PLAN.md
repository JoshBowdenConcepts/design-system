# Design System Plan

A cross-platform design system delivering a consistent visual and interactive language across **web** and **iOS**. The system is split into three layers — **tokens**, **icons**, and **components** — with a TypeScript source of truth that generates platform-specific artifacts.

## Goals

- One source of truth for design decisions, consumed by both web and iOS.
- Ship independently versioned packages to each platform's package manager.
- Keep web (React) and iOS (SwiftUI) components visually and behaviorally aligned over time.
- Start with web, then extend generation to iOS.

## Key Decisions

- **Repo structure**: monorepo using **pnpm workspaces + Turborepo**.
- **Token schema**: **custom TypeScript** schema (not DTCG); each theme part in its own file; variants for **breakpoints**, **color modes**, and **features**.
- **Token generation**: **custom TypeScript generator** (not Style Dictionary).
- **Web docs**: **Storybook**.

## Architecture Overview

```
                    ┌─────────────────────────┐
                    │   TypeScript sources     │
                    │  (tokens as the origin)  │
                    └────────────┬────────────┘
                                 │  generate
             ┌───────────────────┼───────────────────┐
             ▼                                         ▼
      ┌─────────────┐                          ┌─────────────┐
      │     Web     │                          │     iOS     │
      │  CSS Modules│                          │ Swift files │
      │  React libs │                          │ SwiftUI libs│
      └──────┬──────┘                          └──────┬──────┘
             │ publish                                │ publish
             ▼                                        ▼
      npm registry                            Swift Package Mgr
```

## Layers

### 1. Tokens

The foundation. Colors, typography, spacing, radii, shadows, motion, etc.

- **Authoring**: defined in TypeScript as the canonical source, using a **custom TypeScript schema** (not DTCG).
- **Organization**: each theme part lives in its own file (e.g. `color.ts`, `typography.ts`, `spacing.ts`, `radius.ts`, `shadow.ts`, `motion.ts`).
- **Variants**: the schema supports variant axes so token values can differ by:
  - **Breakpoints** (e.g. `sm`, `md`, `lg`, `xl`)
  - **Color modes** (e.g. `light`, `dark`)
  - **Features** (feature-flag / brand / product variations)
- **Generation**: a **custom TypeScript generator** reads the token definitions and emits per-platform files.
- **Web output**: CSS Modules (and/or CSS custom properties), with variants mapped to media queries, `prefers-color-scheme` / mode classes, and feature scopes.
- **iOS output**: Swift files (e.g. color/typography constants or asset catalogs), with variants resolved appropriately per platform.

### 2. Icons

A shared icon set exported per platform.

- **Web**: React components (SVG-based).
- **iOS**: Swift assets / SwiftUI views.
- Sourced from a common set of SVGs where possible.

### 3. Components

Higher-level UI built on tokens and icons.

- **Web**: React components, documented and developed in **Storybook**.
- **iOS**: SwiftUI components.
- Goal: parity in appearance and behavior across platforms over time.

## Platforms

### Web (Phase 1 — start here)

- TypeScript-first.
- Token generation → CSS Modules.
- React component library.
- Published to **npm**.

### iOS (Phase 2)

- Token generation → Swift files from the same TS sources.
- SwiftUI component library.
- Published via **Swift Package Manager**.

## Distribution

| Platform | Language        | Package Manager       |
| -------- | --------------- | --------------------- |
| Web      | TypeScript/React | npm                   |
| iOS      | Swift/SwiftUI    | Swift Package Manager |

## Proposed Monorepo Layout

```
design-system/
├── packages/
│   ├── tokens/            # TS token sources (per-part files) + custom generator
│   │   ├── src/
│   │   │   ├── color.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   ├── radius.ts
│   │   │   ├── shadow.ts
│   │   │   └── motion.ts
│   │   ├── generator/     # emits CSS Modules (web) and Swift (iOS)
│   │   └── dist/          # generated outputs
│   ├── icons/             # shared SVGs → React (web) / SwiftUI (iOS)
│   └── components/        # React component library (Storybook)
├── apps/
│   └── storybook/         # web docs & showcase (or colocated in components)
├── docs/
│   └── PLAN.md
├── pnpm-workspace.yaml
└── turbo.json
```

## Roadmap

1. **Tokens (web)** — define TS token schema, build CSS Module generator.
2. **Icons (web)** — establish SVG pipeline, emit React icon components.
3. **Components (web)** — build React component library on top of tokens + icons.
4. **Publish web** — release packages to npm.
5. **Tokens (iOS)** — extend generator to emit Swift files.
6. **Icons + Components (iOS)** — SwiftUI equivalents.
7. **Publish iOS** — release via Swift Package Manager.

## Open Questions

- Styling approach for web: CSS Modules only, or paired with CSS custom properties (better for runtime color-mode switching)?
- Variant resolution strategy — which axes are compile-time (breakpoints via media queries) vs. runtime (color mode, features)?
- Versioning/release strategy across platforms (independent vs. synced), and tooling (e.g. Changesets for npm).
- iOS token output format (Swift constants vs. asset catalogs) — decide when Phase 2 begins.
