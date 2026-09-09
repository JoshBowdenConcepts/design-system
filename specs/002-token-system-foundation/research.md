# Phase 0 Research: Token System Foundation

The spec's Clarifications session resolved the open product questions ("CSS
module" meaning, axis nesting, specificity ranking, media-query form). This
document records the remaining design decisions needed to implement them.

## D1. Override tree representation

**Decision**: A token is `{ value, description?, overrides? }`. `overrides` is a
`Record<string, OverrideNode>` where each key is an axis-marked string and each
`OverrideNode` is **either** a bare `TokenValue` (leaf shorthand) **or** an
object `{ value?: TokenValue, [axisKey: string]: OverrideNode }`. A node's own
`value` is the value for the condition-set accumulated on the path to that node;
nested axis keys add another condition and recurse.

**Rationale**: Reusing the reserved key `value` at every level keeps the base
value and override values syntactically identical, and makes "value at this
condition, plus deeper refinements" expressible without a second concept. The
bare-leaf shorthand (`dark: "#000"`) keeps the common single-axis case terse.
Order-independence falls out naturally: the resolver keys a rule by the *set* of
conditions on its path, not the traversal order.

**Alternatives considered**:
- Flat `breakpoints` / `colorModes` / `features` maps (the current schema) —
  cannot express cross-axis combinations at all; rejected, this is the feature.
- Array of `{ when: {...}, value }` rules — explicit but verbose, loses the
  "nest in any order" ergonomic the user asked for.
- A distinct `$value` / `_` sentinel key — extra vocabulary for no gain over
  reusing `value`.

## D2. Axis-key grammar

**Decision**: The resolver classifies each override key by shape:

| Axis | Key shape | Examples | Notes |
|------|-----------|----------|-------|
| color mode | bare member of the `ColorMode` union | `light`, `dark` | anything else that is a bare word → error |
| media query | `^\d+\$$` — digits then `$` | `768$`, `1024$` | the number is a `min-width` in px (D6) |
| class-name scope | `^\.[a-z][a-z0-9-]*$` — leading `.` | `.compact`, `.dense` | kebab-case after the dot |

`value` is reserved and never an axis key. Any key matching none of the above (or
a color-mode-looking key not in the union) fails the build with a message naming
the token and the key (FR-007).

**Rationale**: The three shapes are mutually unambiguous on sight (the user's
requirement), need no per-key type annotation, and map 1:1 to a CSS construct.
Leading `.` mirrors a CSS class selector; trailing `$` was the user's suggested
breakpoint marker and does not collide with CSS or JS identifier syntax.

**Alternatives considered**: prefix sigils for every axis (`@768`, `~dark`) —
noisier; a wrapper like `mq(768)` — not a valid object key without quoting
anyway, and no clearer than `768$`.

## D3. Specificity model

**Decision**: Each resolved rule gets an integer weight = sum of axis weights
present in its condition-set:

| Axis present | Weight |
|--------------|-------:|
| color mode | 1 |
| media query | 2 |
| class-name scope | 4 |

So condition-sets rank: `{}`=0, `{cm}`=1, `{mq}`=2, `{cm,mq}`=3, `{scope}`=4,
`{scope,cm}`=5, `{scope,mq}`=6, `{scope,cm,mq}`=7.

Sort key = `(weight, minWidth ?? 0, colorModeOrder, scopeName)` ascending; rules
are emitted in that order, so later rules win in the cascade.

**Rationale**: Binary-place weights (1, 2, 4) give clean tier separation that
satisfies every ordering rule the spec states:
- color mode < media query < class-name scope (every `{mq}` rule > every
  `{cm}`-only rule; every rule containing a scope > every rule without one).
- "any multi-axis combination outranks every one of its single-axis parts":
  `weight(A ∪ B) = weight(A) + weight(B) > max(weight(A), weight(B))`.
- multiple breakpoints in the same tier order by ascending `min-width` (wider
  viewport wins).

**Alternatives considered**: relying on real CSS selector specificity — unusable
here because `:root`, `[data-theme="dark"]`, and `.ds-scope-x` are all `(0,1,0)`
and `@media` adds nothing, so source order would silently decide ties. Computing
an explicit order and emitting in it is the only deterministic option.

## D4. CSS block generation

**Decision**: For each sorted rule, emit `  --ds-<name>: <value>;` inside:

| Condition-set | Wrapper |
|---------------|---------|
| `{}` (base) | `:root { … }` — value is `overrides.light ?? value` (D5) |
| `{cm: dark}` | `[data-theme="dark"] { … }` |
| `{mq: n}` | `@media (min-width: npx) { :root { … } }` |
| `{scope: s}` | `.ds-scope-<s> { … }` |
| combination | nest: `@media` outermost (if present), then a single selector joining the color-mode attribute and the scope class with a descendant combinator, e.g. `@media (min-width: 768px) { [data-theme="dark"] .ds-scope-compact { … } }` |

Rules sharing an identical wrapper are merged into one block (all their
declarations together), preserving overall sorted order between blocks. A file
header comment marks it generated.

**Rationale**: One custom property per token, redeclared per condition, is the
established pattern (001) and needs zero consumer runtime. The descendant
combinator assumes `data-theme` sits on/above `<html>` and scope classes on
wrapper elements below it — the normal arrangement.

**Known limitation (documented, not fixed this phase)**: a scope class on the
*same* element as `data-theme` won't match the `[data-theme] .ds-scope`
descendant form. If a real consumer needs that, a later feature can additionally
emit the `[data-theme="dark"].ds-scope-compact` compound. Recorded in
`contracts/css-output.md`.

## D5. `light` color mode

**Decision**: `light` is not emitted as its own block. The `:root` base block's
value is `overrides.light ?? value`. A `light` key nested with other axes still
contributes the color-mode condition normally (e.g. `{cm: light, scope: x}` →
`.ds-scope-x`, since light is the default surface).

**Rationale**: Light is the default surface (001 convention); a separate
`:root`-targeting block for it would just duplicate specificity with the base and
rely on source order. Matches the current generator's `t.colorModes?.light ??
t.value`.

## D6. Breakpoint unit and registry

**Decision**: The number in a `<number>$` key is a `min-width` in **pixels**. No
breakpoint registry is required — a token may use any number inline. `index.ts`
still exports a `breakpoints` reference map (`{ sm: 640, md: 768, lg: 1024 }`,
numbers) for authors who want named consistency; the generator does not consult
it.

**Rationale**: The user said "breakpoints set by a number" and "each could have
its own value if needed" — inline numbers, no mandatory shared table. Pixels are
the least surprising reading of a bare number. A documented reference map keeps
real breakpoints consistent without coupling the generator to it. Unit control
(rem, etc.) is deferred; noted as an assumption in the spec.

## D7. Category namespacing → variable names & Swift identifiers

**Decision**: Category files export `Tokens` records with plain keys (`body`,
`md`, `bg`). `src/tokens/index.ts` prefixes each with its category:
`type.body`, `space.md`, `color.bg`. `cssVarName` already maps `.`/`_`/camelCase
to kebab: `type.body` → `--ds-type-body`. Swift: sanitize the dotted key to a
camelCase identifier (`type.body` → `typeBody`) in `renderSwift`. The build
throws if two category+key pairs collide on the final variable name.

**Rationale**: Keeps category files free of repeated prefixes, gives a
predictable `--ds-<category>-<name>` surface, and fixes the pre-existing
`renderSwift` bug where a dotted key would emit an invalid Swift identifier.

## D8. `font` shorthand handling

**Decision**: A `type` token value is an opaque string, e.g.
`"italic normal 700 1rem/1.5 'Inter', system-ui, sans-serif"`. The generator
emits it verbatim as `--ds-type-body: italic normal 700 1rem/1.5 'Inter',
system-ui, sans-serif;`. Consumers apply it with `font: var(--ds-type-body);`.
No structural validation of the shorthand this phase (spec edge case).

**Rationale**: Passing through keeps the generator format-agnostic and lets the
user drop in real shorthands later with no code change (FR-012). Commas in the
font-family list are valid inside a custom-property value.

## D9. Determinism

**Decision**: After flattening, sort `ResolvedRule[]` by the D3 sort key
(total order — the "no two rules with the same condition-set" rule guarantees no
ties at the condition-set level). Emit in that order. Category assembly iterates
category files in a fixed declared order and sorts token keys within the final
map. No reliance on object-insertion order from authored overrides.

**Rationale**: FR-010 / SC-003 require byte-identical output for the same source
regardless of nesting order. Canonical sorting at every level is the mechanism.

## D10. Typed data structure for non-CSS consumers (FR-013)

**Decision**: `src/index.ts` exports both `tokens` (the authored tree, as today)
and `resolvedTokens: ResolvedRule[]` (name, condition-set, value, specificity)
computed once via `resolve.ts`. Types for both are exported. `tsc` emits these to
`dist/web/index.js` + `.d.ts` unchanged.

**Rationale**: The authored tree answers "what did the author write"; the
resolved list answers "what is the finalized value under condition X" without a
consumer re-implementing resolution. Both come from the same module the generator
uses, so they cannot disagree.

## D11. Private colour palette + semantic colour tokens (spec Clarifications, FR-015/016)

**Decision**: New internal module `src/palette.ts`:

```ts
// private — NOT re-exported from src/index.ts
export const palette = {
  "neutral.0": "#ffffff",
  "neutral.900": "#111111",
  "blue.500": "#3b82f6",
  // …
} as const;
export type PaletteRef = keyof typeof palette;
export function resolvePaletteRef(ref: string, tokenName: string): string;
```

`src/tokens/color.ts` authors semantic tokens whose `value` and every override
leaf is a `PaletteRef` string (e.g. `"neutral.0"`), not a raw colour. During
assembly/resolution the colour category's leaf values are passed through
`resolvePaletteRef`, replacing each ref with its literal colour **before** any
`ResolvedRule` is built. `resolvedTokens`, `tokens.css`, and Swift therefore only
ever carry literal colours and semantic names (`--ds-color-bg`). `palette` is
never in `src/index.ts`'s export list, so it is absent from `dist/web/index.d.ts`.

An unknown ref → `resolvePaletteRef` throws `"<tokenName>: unknown palette key
'<ref>'"` (rejection R10). `PaletteRef` typing also makes an unknown ref fail
`tsc` for statically-written source (FR-016 authoring-time guard).

**Rationale**: Build-time inlining is the only option that keeps the palette out
of both the CSS and the public API while still letting semantic tokens be
authored against named ramp entries. It matches Constitution I verbatim
("primitive or palette values MAY exist as internal references; public token
APIs MUST expose semantic names, not raw ramps"). The two-tier `var(--ds-palette-*)`
alternative was rejected in `/speckit-clarify`: it would leak the ramp into the
stylesheet and contradict "not exported for use".

**Alternatives considered**: two-tier CSS variables (rejected — leaks ramp);
raw hex in `color.ts` with no palette concept (rejected — the user asked for a
palette layer); a general primitive layer for every category (deferred, FR-017 —
no concrete consumer for space/type primitives yet).

**Scope**: colour only. `type.ts` and `space.ts` author literal values directly.

## D12. "features" axis → "class-name scope" reconciliation (analyze finding C1)

**Decision**: The spec/plan term **"class-name scope"** and the generated
selector prefix **`.ds-scope-<name>`** denote the exact axis the constitution
calls **"features"** (and that the pre-existing generator emitted as
`.ds-feature-<name>`). This is a rename + generalisation (arbitrary named
scopes, not a fixed feature-flag list), **not a new variant axis**. No
constitution amendment is required because the constitution names the axis
("features") without fixing its selector spelling; the `.ds-feature-*` string
lived only in code comments and 001's contract.

**Rationale**: "scope" reads correctly for the general case a design-system
consumer needs (`.ds-scope-compact`, `.ds-scope-marketing`), where "feature"
implied on/off flags. Keeping the constitution's axis list intact (breakpoints,
color modes, features) avoids a spurious "new axis" gate failure.

**Migration note**: 001's `contracts/token-output.md` and the `types.ts` doc
comment reference `.ds-feature-*`; both are updated in this feature (the former
via the supersession pointer, the latter by the `types.ts` rewrite).

## D13. Verifying ordering correctness, not just block sequence (analyze finding G1)

**Decision**: `tests/generate.test.ts` adds an assertion that, walking the
emitted blocks top-to-bottom, the **CSS specificity of each block's selector is
non-decreasing** (computing specificity as an `(a,b,c)` tuple; `@media` wrappers
contribute nothing, per spec). Combined with the `ResolvedRule` sort this proves
that for any token the last matching declaration in source order is also the
most (or equal-most) specific — so the cascade cannot pick a less-specific rule.
A lighter companion check asserts, for a fixture with base + `{dark}` +
`{dark,.scope}` overrides, that the three declarations appear in that relative
order in the file.

**Rationale**: The feature's core promise (FR-009 / SC-002) is "most specific
matching condition wins". The existing plan only tested *block ordering* (dark
before media before scope); it did not test that equal-`(0,1,0)` selectors
(`:root`, `[data-theme="dark"]`, `.ds-scope-x`) are ordered so source-order
tie-breaking yields the right winner. A specificity-monotonicity assertion locks
that without needing a real browser.

**Alternatives considered**: a happy-dom `getComputedStyle` test (heavier, and
happy-dom's cascade fidelity for `@media` + attribute selectors is not
guaranteed); leaving it to the manual quickstart step (insufficient for a
regression gate under Constitution V).
