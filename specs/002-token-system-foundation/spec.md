# Feature Specification: Token System Foundation

**Feature Branch**: `002-token-system-foundation`

**Created**: 2026-09-07

**Status**: Draft

**Input**: User description: "Start to build the token system. I would like it to be created as a typescript object broken into files for each set of tokens. i.e. type, space, color... For type I want the token value to be a single font CSS declaration font: font-style font-variant font-weight font-size/line-height font-family; I would also like these tokens to be overrideabe by nested object structures that are recursive and can go in any order. These overrides should be by color mode, media query, and class name. Class names can start with . or something to make them recognizable. The output for web should be a CSS module the contains the finalized tokens but it should have the overrides in the correct css blocks in the correct order of specificity. Lets start with basic values for each before I provide all the real values"

## Clarifications

### Session 2026-09-07

- Q: What does "CSS module" mean for the web output — a global custom-property
  stylesheet, or true CSS Modules with scoped class names? → A: A single global
  generated stylesheet of `--ds-*` custom properties, with overrides nested in
  `:root` / `@media` / `[data-theme="dark"]` / class-name selector blocks in
  order of specificity. Consumers apply a token via `var(--ds-…)`. This is
  consistent with feature 001's decision (token web output is CSS custom
  properties, not CSS-Modules-style scoped class output).
- Q: How do the three override axes combine and nest? → A: Any of the three axes
  (color mode, media query, class-name scope) can nest inside any other, in any
  order, recursively and to any depth. `dark` inside a media-query key and that
  same media-query key inside `dark` express the same condition and MUST resolve
  identically. The generated CSS emits the fully combined condition into the
  correct nested block (e.g. an `@media` block containing a `[data-theme="dark"]`
  selector containing a class-name selector).
- Q: What is the specificity ranking used to order the output? → A: color mode <
  media query < class-name scope (color mode least specific, class-name scope
  most specific). Any multi-axis combination outranks every one of its
  single-axis parts; combinations are then ordered by the same axis priority,
  with a canonical key sort breaking remaining ties.
- Q: What form does the media-query / breakpoint axis take? → A: A numeric
  breakpoint key marked with a trailing `$` (e.g. `768$`), interpreted as a
  `min-width` media query. Larger numbers are more specific (mobile-first:
  wider-viewport overrides win). A shared list of standard breakpoint numbers
  MAY be documented for consistency, but a token MAY use any number inline —
  each token can carry its own one-off breakpoint value. Non-width media queries
  (`print`, `prefers-reduced-motion`, …) are out of scope for this feature.
- Q: How does a semantic color token get its color, given the palette is never
  exported as tokens? → A: Build-time inline. The colour palette is a private
  TypeScript constant (not a `Tokens` record). A colour token references a
  palette entry by key in its base value and in any override; the generator
  resolves the reference to the literal colour at build time. The output CSS
  contains only semantic `--ds-color-<role>` custom properties with resolved
  values — no `--ds-palette-*` variables — and the palette is absent from the
  public typed API (`tokens` / `resolvedTokens`).
- Q: Is the private-palette + semantic-token split color-only or a general
  primitive layer? → A: Color-only for this feature. Other categories (space,
  type, …) author literal values directly. A general primitive layer is deferred
  until a concrete consumer needs it (Constitution: no speculative layers).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Author tokens as grouped TypeScript sets (Priority: P1)

A design system maintainer defines the first real design tokens by editing
TypeScript source, with each category of token (typography, space, color, and
any future category) living in its own dedicated source file. Each token has a
single base value. Typography tokens express their value as one complete CSS
`font` shorthand string (`font: <style> <variant> <weight> <size>/<line-height>
<family>`), so a consumer applies an entire type style with one declaration.

**Why this priority**: The whole system is blocked on having a token authoring
format that real values can be written into. This replaces the scaffold's single
`placeholder` token with a real, category-organized structure.

**Independent Test**: Add a base value to each category file (e.g. one `space`
step, one `color` role, one `type` style), run the token build, and confirm the
generated web output contains a finalized entry for every authored token with
its base value.

**Acceptance Scenarios**:

1. **Given** an empty category file, **When** the maintainer adds a token with a
   base value and runs the build, **Then** the generated web output contains that
   token's finalized base value and the build exits successfully.
2. **Given** a typography token whose value is a `font` shorthand string, **When**
   the build runs, **Then** the generated web output carries the full shorthand
   string unmodified as that token's finalized value.
3. **Given** tokens split across multiple category files, **When** the build
   runs, **Then** all categories are assembled into one finalized token set with
   no category lost and no name collisions between categories.
4. **Given** a category file with zero tokens, **When** the build runs, **Then**
   it still succeeds and produces valid, empty-but-well-formed output.
5. **Given** a semantic colour token whose base value is a reference to a private
   palette entry, **When** the build runs, **Then** the generated output contains
   the resolved literal colour for that token and contains no palette entry of
   its own (no `--ds-palette-*`, nothing palette-shaped in the typed API).

---

### User Story 2 - Override token values along nested conditional axes (Priority: P1)

A design system maintainer overrides a token's value for specific conditions:
a color mode (e.g. dark), a responsive condition expressed as a media query, and
a class-name scope (a named styling context that is switched on by adding a class
in the consuming app). Overrides are written as nested objects that can be
combined and nested in any order and to any depth, so a single token can define,
for example, "in dark mode, at wide viewports, under the `compact` scope, use
this value." Each override key carries an axis marker (bare `dark`, `768$`,
`.compact`) so its axis is unambiguous.

**Why this priority**: Design tokens that cannot vary by theme and context are
not usable for a real product. The recursive, order-independent override shape is
the core authoring ergonomic the maintainer asked for.

**Independent Test**: Author a token with a base value plus overrides nested in
two different orders that express the same condition set, run the build, and
confirm both produce the same finalized override value bound to the same
condition.

**Acceptance Scenarios**:

1. **Given** a token with a base value and a dark-color-mode override, **When**
   the build runs, **Then** the generated web output resolves to the base value
   in light mode and the override value in dark mode.
2. **Given** a token whose override nests color mode inside a media-query key,
   and a second token that nests the same media-query key inside the color-mode
   key, **When** the build runs, **Then** both resolve to the same value under
   the same combined condition (nesting order does not change the result).
3. **Given** a token with a class-name-scoped override, **When** the build runs,
   **Then** the override value applies only when that class-name scope is active
   and the base value applies otherwise.
4. **Given** override keys using the axis markers (bare `dark` for color mode,
   `768$` for a breakpoint, `.compact` for a class-name scope), **When** the
   maintainer reads the source, **Then** the axis of every override key is
   unambiguous on sight.
5. **Given** a token with overrides for a combination of all three axes (color
   mode + media query + class name), **When** the build runs, **Then** the
   generated web output contains a resolved value for that full combination.

---

### User Story 3 - Consume finalized tokens as ordered web output (Priority: P1)

A web engineer consumes the generated web stylesheet in an application. Every
token resolves to its correct value for the current color mode, viewport, and
active class-name scopes purely through the CSS cascade — the engineer does not
run any resolution logic. Override rules are emitted into the correct kind of CSS
block (color-mode block, media-query block, class-name block, and combinations)
and ordered so that the more specific condition always wins over the less
specific one, regardless of the order the overrides were authored in.

**Why this priority**: The authored token tree is only valuable if it produces a
correct, drop-in web artifact. Incorrect ordering silently ships the wrong value.

**Independent Test**: Build a token set with deliberately conflicting overrides
(a base value, a color-mode override, and a color-mode + class-name override that
disagree), load the output in a browser, toggle the color mode and the class-name
scope, and confirm the displayed value matches the most specific matching
condition every time.

**Acceptance Scenarios**:

1. **Given** a token with a base value and a dark-mode override, **When** the
   output is loaded and the color mode is dark, **Then** the dark value is in
   effect without any script running.
2. **Given** a token with both a color-mode override and a more specific
   color-mode + class-name override, **When** both conditions are active, **Then**
   the combined-condition value wins.
3. **Given** two builds of the same source with overrides authored in different
   nesting orders, **When** the outputs are compared, **Then** they are
   byte-identical (deterministic ordering).
4. **Given** the generated output, **When** it is inspected, **Then** base values
   appear first, then single-axis overrides, then multi-axis combinations, each
   group ordered so specificity increases down the file.
5. **Given** a token category is regenerated from unchanged source, **When** the
   output is compared to the previous output, **Then** it is unchanged.

---

### Edge Cases

- What happens when two category files declare a token with the same name? The
  build MUST fail with an error naming the collision, not silently pick one.
- What happens when an override references a color mode that is not a supported
  color mode, or a media-query / class-name key that is malformed? The build MUST
  fail with an error identifying the offending key and token.
- What happens when a token has overrides but no base value? The build MUST fail
  with a clear error — every token needs a base value to fall back to.
- What happens when two overrides resolve to the *same* condition-set for the
  same token (a genuine authoring conflict)? The build MUST fail with an error
  naming the token and the duplicated condition-set (no silent last-writer wins).
- What happens when a typography token's `font` shorthand string is not a valid
  CSS `font` declaration (e.g. missing size or family)? For this foundation
  phase the string is passed through unvalidated; structural validation of the
  `font` shorthand is deferred to a later hardening feature.
- What happens when a class-name scope is active but the viewport / color-mode
  condition on the same override is not met? The base (or next-most-specific
  matching) value MUST apply — a partially matched combination does not apply.
- What happens when an override uses a non-width media query (`print`,
  `prefers-reduced-motion`, …)? Out of scope for this feature — the media-query
  axis accepts only numeric `min-width` breakpoint keys (`<number>$`). A
  non-numeric media-query key MUST be rejected by the build.
- What happens when a token declares two breakpoint keys with the same number
  (e.g. `768$` twice via different nesting)? Treated as the same condition — a
  duplicate condition-set, which the build rejects per the rule above.
- What happens when a semantic colour token references a palette key that does
  not exist? The build MUST fail with an error naming the token and the missing
  palette key.
- What happens if someone inspects the generated CSS or the public token API for
  palette values? They are never present — only resolved semantic
  `--ds-color-<role>` entries. The palette exists solely as a build-time input.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Tokens MUST be authored in TypeScript source, organized as one
  source file per token category (typography, space, color, and any additional
  category added later), assembled into a single finalized token set by the
  build.
- **FR-002**: Each token MUST have exactly one base value and MAY have overrides.
  A token with overrides but no base value MUST be rejected by the build.
- **FR-003**: Typography token values MUST be expressible as a single complete
  CSS `font` shorthand string covering style, variant, weight, size, line height,
  and family, such that one declaration applies the entire type style.
- **FR-004**: A token's overrides MUST be authorable as nested object structures
  that combine three condition axes — color mode, media query, and class-name
  scope — in any nesting order, recursively, to any depth. Two trees expressing
  the same set of conditions for a token MUST resolve to the same finalized value
  regardless of authoring order or nesting direction (e.g. color mode nested
  inside a breakpoint vs. that breakpoint nested inside color mode).
- **FR-005**: Every override key MUST declare its axis by a marker so the axis is
  unambiguous on sight: a bare color-mode name (`light` / `dark`) for the
  color-mode axis, a number with a trailing `$` (e.g. `768$`) for the
  media-query axis, and a leading `.` (e.g. `.compact`) for the class-name-scope
  axis.
- **FR-006**: Color-mode overrides MUST support at least the supported color
  modes of the system (light and dark); `light` refines the default surface and
  `dark` targets the dark-mode surface.
- **FR-006a**: A media-query override key MUST be a positive number with a
  trailing `$`, interpreted as a `min-width` breakpoint. A non-numeric or
  otherwise malformed media-query key MUST be rejected by the build. A token MAY
  use any breakpoint number inline; a shared reference list of standard
  breakpoint numbers MAY be documented but MUST NOT be required.
- **FR-007**: The build MUST reject, with an error that names the token and the
  offending key, any override that references an unknown color mode, a malformed
  media-query key, or a malformed class-name key; any duplicate token name across
  category files; and any token for which two override branches resolve to the
  same combined condition-set.
- **FR-008**: The build MUST emit a web stylesheet artifact containing every
  finalized token, in which base values and all override conditions are placed
  into the correct kind of CSS block (color-mode, media-query, class-name, and
  their combinations) so that resolution happens entirely through the CSS cascade
  with no runtime logic in the consuming app.
- **FR-009**: In the web output, override rules MUST be ordered so that for any
  token, when multiple conditions match at once, the value bound to the most
  specific condition-set takes effect; this ordering MUST be independent of the
  order overrides were authored in. Axis specificity ranks color mode < media
  query < class-name scope; any multi-axis combination outranks every one of its
  single-axis parts; remaining ties use a canonical key sort (breakpoints
  ascending by number).
- **FR-010**: The web output MUST be deterministic: the same token source
  produces byte-identical output on every build, and regenerating from unchanged
  source produces an unchanged file.
- **FR-011**: The token build MUST succeed and produce valid, empty-but-well-
  formed output when a category file, or the whole token set, has no authored
  tokens.
- **FR-012**: This feature MUST seed each token category with basic placeholder
  values only (enough to exercise every axis and the ordering rules); real design
  values are provided in a later step and MUST NOT require a schema change to
  add.
- **FR-013**: The finalized token values MUST also remain available to consumers
  as a typed data structure (not only as the web stylesheet), so non-CSS
  consumers can read a token's base value and its overrides.
- **FR-014**: The typed token authoring surface MUST make an invalid token
  reference or an invalid override shape fail at authoring/build time, not at
  runtime in a consuming app.
- **FR-015**: The colour category MUST be authored in two parts: (a) a **private
  palette** of raw colour values, authored as a plain TypeScript constant (not a
  token record), and (b) **semantic colour tokens** whose base value and
  overrides reference palette entries by key. The palette MUST NOT be emitted as
  CSS custom properties and MUST NOT appear in the public typed token API; it is
  a build-time input only. Only semantic colour tokens appear in any output.
- **FR-016**: The build MUST resolve every palette reference (in a semantic
  colour token's base value or any override) to a literal colour value before
  emission. A reference to a palette key that does not exist MUST be rejected
  with an error naming the token and the missing key.
- **FR-017**: The private-palette / semantic-token split applies to the colour
  category only in this feature. Other categories author literal values directly;
  a general primitive layer is out of scope.

### Key Entities *(include if feature involves data)*

- **Token**: A single named design decision. Has one base value, an optional set
  of overrides, and an optional human-readable description. Belongs to exactly one
  category.
- **Token Category**: A named group of related tokens (typography, space, color,
  …), authored in its own source file. Categories are assembled into one
  finalized token set.
- **Color Palette (private)**: An internal ramp of raw colour values (e.g.
  `blue.500`), authored as a plain TypeScript constant — not a token record.
  Referenced by semantic colour tokens and resolved at build time. Never emitted
  to CSS, never in the public token API.
- **Semantic Color Token**: A token in the colour category whose base value and
  overrides are palette references (keys into the private palette), resolved to
  literal colours by the build. The only colour form that reaches any output.
- **Override**: A conditional value for a token, addressed by a combination of
  one or more condition axes (color mode, media query, class-name scope). Authored
  as a nested tree; resolved to a flat (condition-set → value) mapping.
- **Condition Axis**: One dimension an override can vary along. Three axes exist,
  in increasing specificity: color mode, media query, then class-name scope. Each
  axis contributes a known amount of specificity to the ordering of the web
  output.
- **Finalized Token Set**: The complete, assembled, resolved collection of all
  tokens and their overrides — the input to every platform projection (web
  stylesheet, typed data structure).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A maintainer can add a new token to a category file, with a base
  value and overrides across all three axes, and see it correctly reflected in
  the web output after one build command, with no other files edited.
- **SC-002**: For a token set containing deliberately conflicting overrides,
  100% of condition combinations resolve in the browser to the value of the most
  specific matching condition, verified by toggling color mode and class-name
  scopes.
- **SC-003**: Building the same token source twice produces byte-identical web
  output 100% of the time, including when overrides are re-authored in a
  different nesting order.
- **SC-004**: 100% of authoring errors in the target set (duplicate token name,
  missing base value, unknown color mode, malformed override key) are caught by
  the build with a message that names the specific token and key, before the
  output is written.
- **SC-005**: A typography token defined as a single `font` shorthand applies the
  complete intended type style (style, weight, size, line height, family) with
  one CSS declaration in a consuming context.
- **SC-006**: Every token category ships with at least one placeholder token
  exercising a base value plus at least one override on each axis, so the
  ordering behavior is demonstrable before real values exist.
- **SC-007**: The generated web output and the public token API contain zero
  palette entries — only semantic colour tokens — while 100% of semantic colour
  values (base and overrides) still resolve to a palette colour.

## Assumptions

- This feature evolves the existing `@design-system/tokens` package: it replaces
  the single scaffold `placeholder` token with the category-file structure and
  the recursive override schema. The existing flat `breakpoints` / `colorModes` /
  `features` fields on the token type are superseded by the recursive override
  model.
- Per the Clarifications, the web output is a single global stylesheet of
  `--ds-*` custom properties (not CSS Modules), consistent with feature 001.
- The web output emits one CSS custom property per token (name prefixed `--ds-`),
  redeclared inside each condition block, so consumers apply a token via
  `var(--ds-…)` (for typography, `font: var(--ds-type-…)`).
- Color-mode selection in the consuming app follows the existing convention
  (`[data-theme="dark"]` for dark; default surface is light).
- Class-name scopes are opt-in: a scope's overrides only apply when the consuming
  app adds the corresponding class to an ancestor element.
- iOS / Swift projection of the new override model is out of scope for this
  feature; the Swift output MAY continue to emit base values only until a later
  feature defines iOS variant resolution. The typed data structure (FR-013)
  remains available for all consumers.
- Specificity ordering among the three axes is fixed per the Clarifications
  (color mode < media query < class-name scope; combinations outrank their
  parts).
- The breakpoint number's unit resolves to a single documented project constant
  (default: pixels); introducing per-unit control is a later concern.
- "Basic values" for the first pass are non-final placeholders clearly labelled
  as such, following the scaffold's precedent for placeholder content.
- The colour category is authored as a private palette (plain TS constant) plus
  semantic colour tokens that reference it by key; references resolve to literal
  values at build time (Clarifications). The palette is never emitted or
  exported. This split is color-only for this feature (FR-017); space and type
  author literal values directly. This satisfies Constitution I ("primitive or
  palette values MAY exist as internal references; public token APIs MUST expose
  semantic names, not raw ramps").
- Determinism is achieved by sorting the resolved (condition-set → value) map by
  a canonical key order before emission, not by preserving authoring order.
- Feature 001's `token-output.md` contract (flat `:root` / single `@media` /
  `[data-theme="dark"]` blocks) is superseded by this feature's nested,
  specificity-ordered output; the contract is updated during planning.
