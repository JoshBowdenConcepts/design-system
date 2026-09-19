# Implementation Plan: Text Component

**Branch**: `003-text-component` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-text-component/spec.md`

## Summary

Add a typed, polymorphic React `Text` component to `@design-system/components`.
It will default to `p`, accept a constrained intrinsic `as` element, and accept
type-token-backed variants that override the selected element's default style.
CSS Modules will provide locally scoped token-based styles. Because the package
uses `tsc` rather than a CSS-aware bundler, the existing component generator
will copy the module asset into `dist/web`. Runtime tests, compile-time type
tests, package build checks, and a canonical Storybook story will verify the
public contract.

## Technical Context

**Language/Version**: TypeScript 5.7, React 18 types, Node.js 22+.

**Primary Dependencies**: Existing React peer dependencies, `@design-system/tokens`, TypeScript, Vitest, Vite/Storybook. No new runtime dependency.

**Storage**: N/A.

**Testing**: Vitest SSR tests, TypeScript type-test project, package typecheck/build, Storybook build and accessibility/snapshot checks.

**Target Platform**: Web React consumers and Storybook; iOS unchanged.

**Project Type**: Independently shippable component package in the existing pnpm/Turborepo monorepo.

**Performance Goals**: Preserve the existing component build time; Text rendering adds no runtime registry, style injection, or resolution pass.

**Constraints**: All design values come from token CSS variables. `as` and `variant` must not reach the DOM. CSS Module assets must be present in published `dist/web`. The selected element must control native prop and ref typing. Existing package build conventions and dependency direction must remain intact.

**Scale/Scope**: One public component, one CSS Module, one style declaration, focused component/type tests, one Storybook story, and component build-generator asset handling.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate for this feature | Status |
|---|---|---|---|
| I | Tokens Are the Source of Truth | Text font styles use existing `--ds-type-*` tokens; no duplicated design values. | PASS |
| II | Generate, Do Not Fork | CSS Module is a web projection that consumes shared token output; no parallel token values are introduced. | PASS |
| III | Layered, Independently Shippable Packages | Change stays in `packages/components` plus its Storybook consumer; dependency direction remains components -> tokens. | PASS |
| IV | Accessibility Is Non-Negotiable | Semantic `as` output is preserved, native behavior is forwarded, and Storybook a11y checks cover examples. | PASS |
| V | Tooling Enforces the Contract | Runtime tests, type tests, package build, Storybook docs, and CSS asset checks gate the public API. | PASS |

**Result (pre-Phase 0)**: PASS. No violations or new dependencies.

**Re-check (post-Phase 1 design)**: PASS. The design adds no package, variant axis, or competing source of truth. CSS Module asset copying is build plumbing required to preserve the existing package output contract.

## Project Structure

### Documentation (this feature)

```text
specs/003-text-component/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── component-api.md
    └── css-module-build.md
```

### Source Code (repository root)

```text
packages/components/
├── package.json                 # preserve package exports; retain CSS asset in files/sideEffects
├── src/
│   ├── Text.tsx                 # generic forwardRef component and public types
│   ├── Text.module.css         # scoped element defaults and variant token rules
│   ├── css-modules.d.ts        # declaration for *.module.css imports
│   ├── index.ts                 # export Text and public types
│   └── generate.ts              # copy Text.module.css into dist/web during build
├── tests/
│   ├── Text.test.tsx            # SSR behavior and class/attribute contract
│   └── Text.types.tsx           # positive and @ts-expect-error type cases
├── tsconfig.json
└── tsconfig.text-tests.json     # dedicated type-test compiler configuration

apps/docs/
└── src/
    └── Text.stories.tsx         # public semantic/variant/native-prop examples
```

**Structure Decision**: Extend the existing components package in place. Keep
implementation, CSS, and tests colocated under `packages/components`; use a
separate type-test config because the package's build config excludes tests.
Storybook remains the canonical web documentation surface and consumes the
source component through the existing Vite setup.

## Implementation Phases

### Phase 0: Research

- Confirm existing component, token, TypeScript, Vitest, Vite, and Storybook
  conventions.
- Resolve the supported intrinsic element and variant unions, variant precedence,
  ref typing, CSS Module declaration, and published asset strategy.
- Record decisions in `research.md`.

### Phase 1: Design and contracts

- Define the polymorphic props and style-resolution entities in `data-model.md`.
- Document the public TypeScript API and CSS Module build contract.
- Document executable validation in `quickstart.md`.

### Phase 2: Implementation

- Add `Text.tsx`, `Text.module.css`, and the CSS Module declaration.
- Update the public component export and generator asset copying.
- Add runtime and compile-time tests.
- Add the Storybook Text story and update any generated snapshots required by the
  repository's existing documentation gates.
- Run package test, typecheck, lint, build, Storybook build, and a11y/snapshot
  validation.

## Complexity Tracking

No constitution violations. No complexity exception is required.
