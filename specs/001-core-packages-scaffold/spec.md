# Feature Specification: Core Packages Scaffold

**Feature Branch**: `001-core-packages-scaffold`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "I would like to build out the scaffolding for this project we will have at least 3 packages one for tokens, one for icons, and one for components. Now I am not sure if we should separate these out between web and iOS but lets dive into that with a pros and cons list provided by you."

## Clarifications

### Session 2026-08-27

- Q: Should tokens/icons/components be split into separate packages per platform (web vs. iOS), or live in one package per layer that generates output for both platforms? → A: One package per layer (tokens, icons, components — 3 packages total). Each package holds shared source plus generated output for both web and iOS, so a design decision is written once and cannot drift between platforms.
- Q: Given one package per layer, can each platform still be developed and tested locally without depending on the other platform's toolchain? → A: Yes. Each package exposes a web-consumable output (installed via the workspace package manager, used directly by web tooling) and an independently addressable iOS output (a local, path-based reference usable by Xcode/Swift tooling before anything is published), generated from the same shared source.
- Q: Should the tokens package emit its web styling output as CSS custom properties, CSS Modules, or both? → A: CSS custom properties (CSS variables). Values are emitted as `var(--…)`-consumable declarations that can be scoped inside selector blocks — media queries (breakpoints), class-name selectors (features), and light/dark color-mode selectors — so variant-axis resolution happens via nested selectors, not separate output formats. CSS Modules are not part of the token output.
- Q: What npm package names should the three packages use in their manifests? → A: Scoped under `@design-system` for now: `@design-system/tokens`, `@design-system/icons`, `@design-system/components`. The `@design-system` scope is a placeholder to be renamed via find-and-replace once the scaffold is built; the scaffold MUST keep the scope string consistent across all manifests, imports, and docs so a single rename is safe.
- Q: Where should each package's generated iOS output live for use as a Swift Package Manager local path dependency? → A: A single `Package.swift` at the repository root exposes tokens, icons, and components as three separate SwiftPM products/targets. An iOS consumer references the repo once via `.package(path: "…/design-system")` and depends on the individual products. The three products still respect the one-way dependency direction (icons → tokens, components → tokens + icons). Generated Swift sources for all three targets are produced by the packages' generate steps and assembled under the root SwiftPM layout.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Stand up the three foundational packages (Priority: P1)

A design system maintainer creates the initial repository scaffolding so that
tokens, icons, and components each have a dedicated, working package with a
build/generate step, before any real token values, icons, or components are
authored.

**Why this priority**: Nothing else in the project can start until these three
packages exist with a working build pipeline. This is the minimum viable
foundation.

**Independent Test**: Can be fully tested by running the generate/build command
for each of the three packages from a clean checkout and confirming each
produces its expected output directory (even if that output is a minimal
placeholder), with no errors.

**Acceptance Scenarios**:

1. **Given** a clean checkout of the repository, **When** the maintainer installs
   dependencies and runs the workspace build, **Then** all three packages
   (tokens, icons, components) build successfully with no errors.
2. **Given** the three packages exist, **When** the maintainer inspects the
   repository structure, **Then** each package has its own directory, its own
   package manifest, its own version, and a documented public entry point.
3. **Given** the tokens package builds, **When** the icons or components
   package builds, **Then** they successfully resolve tokens as a dependency
   (proving the one-way dependency direction works end to end).

---

### User Story 2 - Local web development loop (Priority: P2)

A web engineer working in this monorepo makes a change to a package's source
and sees that change reflected in the web consumption path (e.g., a running
Storybook or local app) without needing to publish anything.

**Why this priority**: Fast local iteration is required for the team to
actually build on top of the scaffolding. Without it, every change requires a
slow publish/install cycle.

**Independent Test**: Can be fully tested by editing a source file in one of
the three packages, re-running the workspace build/dev command, and observing
the updated output available to a local web consumer without a publish step.

**Acceptance Scenarios**:

1. **Given** the workspace is running in dev mode, **When** a source file in
   any of the three packages changes, **Then** the rebuilt output is available
   to other workspace packages without a manual publish or install step.
2. **Given** a package's web output changed, **When** the web engineer looks at
   the local docs/dev environment, **Then** the change is visible.

---

### User Story 3 - Local iOS development loop (Priority: P3)

An iOS engineer references a package's generated Swift output as a local,
unpublished dependency from an Xcode project, so they can validate iOS output
before anything is tagged or published to a package registry.

**Why this priority**: iOS is a Phase 2 concern, but the scaffolding should
prove the local iOS path works in principle so it is not a surprise later.
Lower priority than the web loop because no real iOS consumer exists yet.

**Independent Test**: Can be fully tested by pointing a local Swift Package
Manager reference at a package's generated iOS output directory on disk and
confirming it resolves without requiring the package to be published anywhere.

**Acceptance Scenarios**:

1. **Given** the repo-root `Package.swift` exposes tokens/icons/components as
   SwiftPM products, **When** an iOS engineer references the repository as a
   local path dependency and depends on one of those products, **Then** the
   reference resolves without a network fetch or publish step.

---

### Edge Cases

- What happens when a package's generate/build step is run before its
  dependency (e.g., icons before tokens) has ever been built? The build MUST
  either fail with a clear error identifying the missing dependency, or
  automatically build the dependency first — not silently produce empty/stale
  output.
- What happens if a change to the tokens package would change output consumed
  by the icons or components package, but those packages have not been
  rebuilt? The workspace build MUST rebuild all dependents, not just the
  changed package (no stale generated output left in place).
- What happens when a package is scaffolded but has no real content yet (no
  tokens, no icons, no components authored)? The build MUST still succeed and
  produce a valid, empty-but-well-formed output (not an error), so the
  scaffolding is independently verifiable before content exists.
- What happens when someone tries to add a fourth top-level package layer, or
  have icons depend on components? This MUST be rejected by automated tooling —
  a workspace build / CI check fails and names the offending package — not
  left to convention or code review. (`icons` depending on `tokens`, and
  `components` depending on `icons`, are permitted but not required; only the
  reverse directions and additional top-level layers are rejected.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST contain exactly three foundational packages:
  one for tokens, one for icons, and one for components. They MUST be named
  `@design-system/tokens`, `@design-system/icons`, and
  `@design-system/components` in their manifests. The `@design-system` scope
  is a temporary placeholder; the scaffold MUST use it consistently across
  every manifest, cross-package import, and doc reference so it can be renamed
  later with a single find-and-replace.
- **FR-002**: Each package MUST be independently versioned and independently
  buildable/testable, with its own manifest and documented public entry point.
- **FR-003**: The tokens package MUST NOT depend on the icons or components
  packages. The icons package MAY depend on the tokens package. The
  components package MAY depend on the tokens and icons packages. This
  dependency direction MUST be enforced by the workspace tooling (e.g., a
  build/lint failure on violation), not left as convention only.
- **FR-004**: Each package MUST provide a generate/build step that can run
  from a clean checkout with no manual setup beyond activating the
  repo-pinned package manager (`corepack enable`) and installing dependencies
  (`pnpm install`). No per-package setup steps.
- **FR-005**: Each package's generate/build step MUST succeed even when the
  package has no real authored content yet (placeholder/empty-but-valid
  output).
- **FR-006**: Each package MUST produce a web-consumable output that other
  workspace packages and a local web documentation/dev environment can use
  immediately after a build, without a publish step.
- **FR-006a**: The tokens package's web styling output MUST be CSS custom
  properties (CSS variables), emitted so they can be declared inside scoped
  selector blocks — media queries (breakpoints), class-name selectors
  (features), and light/dark color-mode selectors — so variant axes resolve
  via nested selectors. The token output MUST NOT emit CSS Modules. Icons and
  components consume tokens as `var(--…)` references.
- **FR-007**: The repository MUST expose an iOS-addressable output via a
  single `Package.swift` at the repository root that declares three separate
  SwiftPM products/targets (tokens, icons, components), each populated with
  generated (or explicitly stubbed) Swift sources. An iOS project MUST be able
  to reference the repo once as a local path dependency
  (`.package(path: "…/design-system")`) and depend on any individual product,
  with no publish step and no network fetch, after a workspace build has
  generated the Swift sources (`pnpm build`); before that build the generated
  `dist/ios/**` does not exist and resolution is expected to fail. The SwiftPM
  target dependencies MUST mirror the one-way direction: icons → tokens,
  components → tokens + icons.
- **FR-008**: The workspace build MUST rebuild dependent packages when a
  package they depend on changes, so generated output never goes stale
  relative to its source.
- **FR-009**: The scaffolding MUST include a minimal local documentation/dev
  environment for web (e.g., a running docs app) that reflects changes to any
  of the three packages after a rebuild.
- **FR-010**: The scaffolding MUST NOT include any real design tokens, icons,
  or components as part of this feature — only the structural packages,
  build pipeline, and placeholder content needed to prove the pipeline works.
  "Placeholder content" means one artifact per package that is named or
  clearly labelled as a placeholder and carries no design intent — e.g. a
  token `placeholder`, an icon `PlaceholderIcon`, a component `Placeholder`. A
  value has design intent (is "real", hence out of scope) if a consumer would
  reasonably use it directly in shipped UI.
- **FR-011**: The scaffolding MUST include, running in CI, (a) a
  visual-regression check and (b) an automated accessibility check over the
  web documentation environment's stories, so rendered-output changes and
  accessibility regressions are gated before merge (Constitution IV, V). The
  only rendered output in this feature is the `Placeholder` component; these
  gates MUST be green for it.

### Key Entities

- **Package**: One of the three foundational units (tokens, icons,
  components). Has a name, a version, a source directory, a generate/build
  step, a web output, and an iOS output. Declares its dependencies on other
  packages.
- **Generated Output**: The build artifacts produced by a package's
  generate/build step for a given platform (web or iOS). Derived entirely
  from the package's source; never hand-edited.
- **Local Dev Environment**: The mechanism (e.g., a docs app) through which a
  web engineer observes a package's output during local development.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After a one-time environment step (`corepack enable`), a new
  contributor goes from a clean checkout to all three packages built
  successfully with two documented commands — `pnpm install`, then
  `pnpm build` — in under 5 minutes on a typical developer laptop with a warm
  package cache.
- **SC-002**: 100% of the three packages have an independently runnable
  build/generate step and an independently runnable test step.
- **SC-003**: Measured from saving a source file in any one package to that
  change being visible in the already-running local web documentation
  environment (Storybook), elapsed time is under 30 seconds, with no manual
  publish or install step. Baseline: a typical developer laptop, dev server
  already running, warm Turborepo cache.
- **SC-004**: An attempt to introduce a disallowed dependency direction
  (e.g., tokens depending on components) is caught by the build/lint step
  100% of the time, before code review.
- **SC-005**: An iOS engineer can reference the repository once as a local
  path dependency and depend on any of the three SwiftPM products
  (tokens, icons, components), having it resolve successfully on the first
  attempt after `pnpm build`, with no publish step and no network fetch.

## Assumptions

- This feature is scaffolding only: no real token values, icon assets, or
  components are authored as part of it. Later features add real content on
  top of this foundation.
- "iOS output" in this phase may be a stub/placeholder (e.g., minimal
  generated Swift files behind a single repo-root `Package.swift` with three
  products) rather than a fully built-out Swift artifact, since iOS is a
  Phase 2 platform per the project constitution. The scaffolding only needs to
  prove the local-path-dependency mechanism works, not ship real iOS
  functionality.
- The web local documentation environment is Storybook, per the project
  constitution's technology constraints.
- Web styling output is CSS custom properties (see FR-006a); the CSS
  Modules alternative left open by the constitution is explicitly not taken.
- The monorepo uses pnpm workspaces and Turborepo, per the project
  constitution's technology constraints; "workspace build" and "local
  linking without publish" in this spec refer to that tooling's standard
  capabilities.
- Enforcement of the one-way dependency direction (FR-003) is assumed to be
  achievable through the package manager's dependency graph plus a lint/build
  rule; the specific rule implementation is a planning-phase decision.
- Visual-regression and accessibility harnesses (`@storybook/test-runner`
  with snapshot + `axe` assertions) are stood up in this feature so
  Constitution IV and V are gated from the first rendered output. Real
  components — starting with a Text component — arrive in a follow-up feature
  and are the first to exercise these gates against meaningful UI.
- Supported runtime is Node.js 22+; CI runs Node 24.
