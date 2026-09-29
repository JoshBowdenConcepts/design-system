# Data Model: iOS Component Workbench

This feature adds development-time catalog data and a generated native
typography projection. It introduces no persisted user or runtime account data.

## Entity: Component Example

A named catalog entry that creates an independently viewable component preview.

| Field           | Type                               | Validation / meaning                                                                                  |
| --------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| id              | String                             | Stable, unique identifier within the catalog; lowercase, dot-separated package/component/example name |
| title           | String                             | Non-empty label shown in the catalog                                                                  |
| component       | Component kind                     | Identifies the component rendered by the example; initial kind is Text |
| initial content | String                             | Editable sample value supplied when the example opens |
| role            | Text Role or none                  | Typed role supported by the selected component |

**Relationships**: Each example references one component kind. A component may
have multiple examples, including one independently selectable example for each
supported Text role. The detail view selects the component renderer by kind and
passes the typed inputs; catalog entries do not store executable view closures.

**Validation**: Duplicate IDs and empty titles are rejected by catalog tests;
an empty catalog is represented as an explicit empty state, not a blank screen.

## Entity: Text Role

A named visual role shared with the web Text component.

| Field             | Type                 | Validation / meaning                                                                          |
| ----------------- | -------------------- | --------------------------------------------------------------------------------------------- |
| name              | Enum case            | Exactly one of `display`, `h1`, `h2`, `h3`, `h4`, `p`, `p-sm`, `label`, `caption`, `overline` |
| token key         | String               | Corresponding key in `type` tokens; one-to-one mapping with the role                          |
| native text style | SwiftUI text style   | Semantic scaling reference for Dynamic Type                                                   |
| typography        | Generated descriptor | Family face, size, weight, line-height multiplier; generated from the matching source token   |

**Relationships**: A Text Role has exactly one source type token and exactly
one generated native descriptor. It is rendered by the native Text component
and represented by at least one component example.

**Validation**: The generator and contract tests require a complete, unique
mapping across all ten source roles. Missing or malformed source values fail
generation; no fallback descriptor is synthesized.

## Entity: Native Typography Descriptor

A platform projection of one shared typography token.

| Field                  | Type                      | Validation / meaning                                                                      |
| ---------------------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| role                   | Text Role                 | Unique role identifier                                                                    |
| font family            | String                    | Registered PostScript family/face name present in the token resource bundle               |
| point size             | CGFloat-compatible number | Positive; derived from CSS `rem` at the shared 16-point root                              |
| weight                 | Typed weight              | Supported face weight parsed from the shared shorthand and available in bundled resources |
| line-height multiplier | CGFloat-compatible number | Positive; derived from the shorthand's unitless line-height                               |
| dynamic type style     | SwiftUI text style        | Native scaling relationship chosen for the role                                           |

**Relationships**: A descriptor is generated from one type token and consumed
by the Text component; its font face is provided by a token package resource.

**Validation**: Generation is deterministic. Each parsed field must agree with
the source shorthand. Font resources must exist for every referenced family
and weight. Tests verify names, values, role coverage, and resource presence.

## Entity: Workbench Catalog State

Transient navigation and example input state held only while the local app is
running.

| State / field        | Type                             | Meaning                                                         |
| -------------------- | -------------------------------- | --------------------------------------------------------------- |
| selected example     | Component Example ID or none     | Current catalog selection                                       |
| example inputs       | Component-specific values        | Current editable preview content, role, and options             |
| catalog availability | Available, empty, or unavailable | Distinguishes valid content from missing generated dependencies |

**Transitions**: launch → available/empty/unavailable; available → selected
example → changed input → refreshed preview; selected example → catalog.
Missing generated package data must be surfaced rather than substituted with
fabricated styles.
