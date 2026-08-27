<!--
Sync Impact Report
- Version change: unratified template → 1.0.0
- Modified principles:
  - [PRINCIPLE_1_NAME] → I. Tokens Are the Source of Truth
  - [PRINCIPLE_2_NAME] → II. Generate, Do Not Fork
  - [PRINCIPLE_3_NAME] → III. Layered, Independently Shippable Packages
  - [PRINCIPLE_4_NAME] → IV. Accessibility Is Non-Negotiable
  - [PRINCIPLE_5_NAME] → V. Tooling Enforces the Contract
- Added sections: Technology Constraints; Quality Gates
- Removed sections: none (template placeholders replaced in place)
- Follow-up TODOs: none
-->

# Design System Constitution

## Core Principles

### I. Tokens Are the Source of Truth

Every visual decision — color, typography, space, radius, shadow, motion, and
equivalent theme parts — MUST originate in TypeScript token definitions.

- Components, icons, and platform artifacts MUST consume generated token
  outputs. Hardcoded design values in shipped UI are forbidden.
- Each theme part MUST live in its own source file.
- Primitive or palette values MAY exist as internal references. Public token
  APIs MUST expose semantic names, not raw ramps.
- Token values MUST be expressible across variant axes: breakpoints, color
  modes, and features. An axis MUST NOT be added without a concrete consumer.

Rationale: Cross-platform consistency collapses the moment values are copied
by hand into components or native files.

### II. Generate, Do Not Fork

Web and iOS MUST share one origin for design decisions. Platform packages are
projections of that origin, not independent design systems.

- A design change MUST land once in shared sources and propagate through
  generation.
- Generated or platform-specific files MUST NOT introduce a competing value
  for the same decision.
- Web ships first. iOS generation, when started, MUST reuse the same token
  and icon sources; it MUST NOT establish a parallel source of truth.

Rationale: Parity is a generation problem. Forked values become permanent
drift.

### III. Layered, Independently Shippable Packages

The system has exactly three layers: **tokens**, **icons**, and **components**.

- Each layer MUST be a self-contained, independently versioned, independently
  testable package with a documented public API.
- Dependency direction is one-way: icons MAY depend on tokens; components MAY
  depend on tokens and icons. Tokens MUST NOT depend on icons or components.
- Circular dependencies are forbidden.
- A package MUST NOT exist solely to group other packages. Every package MUST
  have a purpose a consumer can depend on.

Rationale: Independent versioning lets web and iOS adopt at different speeds
without blocking each other.

### IV. Accessibility Is Non-Negotiable

Every user-facing component MUST meet WCAG 2.2 Level AA.

- Semantic color pairings MUST meet contrast requirements in every supported
  color mode.
- Interactive components MUST be operable by keyboard and MUST expose a
  correct accessibility name and role.
- Accessibility MUST be designed in and gated before merge. It MUST NOT be
  deferred to a polish pass.

Rationale: A design system that ships inaccessible defaults multiplies harm
across every product that adopts it.

### V. Tooling Enforces the Contract

Conventions MUST be enforced by generators, types, lint rules, tests, and CI.
Documentation alone is not a control.

- Generated artifacts MUST be reproducible from committed sources.
- Public APIs MUST be typed. Invalid token references MUST fail at build or
  typecheck time, not at runtime in consuming apps.
- Visual regression MUST gate changes to rendered component appearance.
- Storybook MUST document every public web component and token group before
  that API is considered complete.

Rationale: Adoption depends on the system being hard to use incorrectly.

## Technology Constraints

- Repository shape is a **pnpm + Turborepo** monorepo.
- Token authoring uses a **custom TypeScript schema**, not DTCG JSON.
- Token emission uses a **custom TypeScript generator**, not Style Dictionary.
- Web stack is TypeScript and React. Web documentation and development happen
  in Storybook. Web packages publish to npm.
- iOS (Phase 2) is Swift and SwiftUI. iOS packages publish via Swift Package
  Manager.
- Runtime is Node.js 22 or newer.

Web styling output (CSS Modules vs. CSS custom properties) and iOS token
file format are implementation choices. They MUST be decided in a feature
spec; they are not fixed by this constitution.

## Quality Gates

- Every `/speckit-plan` Constitution Check MUST pass before Phase 0 research.
  Re-check after Phase 1 design. A failing gate blocks implementation.
- New public APIs require docs in the platform's canonical surface (Storybook
  for web) before merge.
- Token generator and schema changes MUST include contract tests of emitted
  output (names, values, and variant resolution).
- Component visual changes MUST include visual regression coverage.
- Breaking changes follow semantic versioning on the affected package.
  Platforms MAY version independently.
- New dependencies and new variant axes MUST be justified by a concrete
  consumer. Speculative layers are forbidden.

## Governance

This constitution supersedes ad-hoc practice, prior plan notes, and
contributor preference when they conflict.

Amendments MUST:

1. Document the rationale and the practices that change.
2. Bump `CONSTITUTION_VERSION` using the policy below.
3. Include a migration note when a change invalidates existing or planned work.

Versioning policy:

- **MAJOR**: a principle is removed or redefined in a backward-incompatible way.
- **MINOR**: a principle or section is added, or guidance is materially expanded.
- **PATCH**: clarifications, wording, and non-semantic refinements.

Compliance review: every spec, plan, and pull request MUST be checkable
against these principles. If a change cannot satisfy a principle, the change
MUST be redesigned or this constitution MUST be amended first.

Runtime guidance lives in feature specs under `specs/` and in package
READMEs. Those documents MUST NOT contradict this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-08-27 | **Last Amended**: 2026-08-27
