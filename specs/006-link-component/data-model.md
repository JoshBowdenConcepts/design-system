# Data Model: Link Component

This feature has no persistent data model. Its public concepts are immutable
component inputs and native interaction state, layered directly on the
existing `Text` component.

## Link Configuration

Represents a consumer's choices for one Link instance.

| Field | Meaning | Validation |
|---|---|---|
| destination | Where the Link navigates to (`href` on web, `destination: URL?` on iOS) | When present, renders a real native link. When absent, there is no separate "unavailable" flag — its absence *is* the unavailable state (see Link Destination below). |
| size | Typography drawn from Text, restricted to non-heading roles | Must be one of `p`, `p-sm`, `label`, `caption`, or omitted. Omitted means inherit the surrounding text's size (FR-004). Heading/display roles are not members of the type and are rejected at compile time (FR-006). |
| standalone | Whether the Link stands on its own line vs. sits inline in running text | Defaults to `false` (inline). `true` applies the 24×24 minimum interactive target; inline is exempt from that floor so it does not disturb surrounding line metrics (FR-007). |
| external | Whether the destination leaves the current context | Defaults to `false`. `true` adds a visual indicator hidden from assistive technology, adds a new-context statement to the accessible name, and opens the destination in the platform's external browsing context with no opener access on web (FR-011). `false` shows neither (FR-012). |
| content | Visible label content | Required unless an explicit accessible-name override is supplied; visual content alone must not be the only source of the accessible name when content carries no text (FR-014). |
| accessible name override | Optional explicit name for assistive technology | Used when visible content does not itself describe the destination (e.g., an icon-only Link). |

## Link Destination

A derived concept, not a separate field — which of three states a given
`destination` value puts the Link into.

| State | Trigger | Behavior |
|---|---|---|
| Same-context | `destination` present, `external` is `false` | Native link semantics, navigates within the current browsing context/app. |
| External | `destination` present, `external` is `true` | Native link semantics plus the external indicator, new-context accessible-name suffix, and safe external navigation. |
| Unavailable | `destination` absent | Rendered as de-emphasized, non-interactive text: no link role, no destination, absent from the tab order / VoiceOver swipe navigation (FR-013). |

## Link Presentation

| Presentation | Meaning | Target size |
|---|---|---|
| Inline | Sits inside running text; the default | Exempt from the minimum interactive target (2.5.8 exemption for inline). |
| Standalone | Stands on its own, chosen explicitly | Must meet a 24 × 24 minimum interactive target at every supported size. |

## Relationships and State

- One Link Configuration belongs to one platform-specific Link instance.
- Link's typography is never defined by Link itself — `size` (or its absence)
  selects a `Text` variant/`TextRole` and Link renders through `Text`
  (web) / `DesignSystemText` (iOS) rather than owning a parallel type scale.
- A Link has exactly three destination states (same-context, external,
  unavailable); there is no fourth "disabled" state and no busy/loading state.
- Interaction states — resting, hover (web) / pressed (iOS equivalent), and
  focus — apply only to the same-context and external destination states.
  Unavailable has a single, non-interactive presentation.
- Every Link, in every destination state, must resolve to one non-empty
  accessible name once rendered — either from its visible content or the
  explicit override — except the unavailable state, which exposes no link role
  and therefore no accessible name is required to be meaningful to assistive
  technology beyond its plain text content.
