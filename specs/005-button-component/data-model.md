# Data Model: Button Component

This feature has no persistent data model. Its public concepts are immutable
component inputs and native interaction state.

## Button Configuration

Represents a consumer's choices for one Button instance.

| Field | Meaning | Validation |
|---|---|---|
| appearance | Approved visual treatment from the Claude Design inventory | Must be one of `solid`, `outline`, `text`. |
| size | Approved control size | Must be one of `sm` (30px), `md` (38px). Icon-only content uses these same two sizes rather than a distinct size. |
| label | Visible action text, when present | May be omitted only for icon-only content; icon-only usage requires an accessible name. |
| leading icon | Optional platform-native content before the label | May be omitted independently from the trailing icon. |
| trailing icon | Optional platform-native content after the label | May be omitted independently from the leading icon. |
| full width | Whether the control fills available horizontal space | Defaults to `false`. |
| content alignment | Layout of label and icon slots when full width | `center` by default; `space-between` distributes present slots across available width. |
| disabled | Whether activation is prevented | Disabled control must not invoke its action and must expose its disabled state. |
| accessible name | Name exposed to assistive technology | Required and non-empty for icon-only content; use the platform's native naming mechanism. |
| action | Consumer behavior invoked on activation | Invoked only for enabled activation. Web additionally supports native button type and defaults to non-submitting. |

## Relationships and State

- One Button configuration belongs to one platform-specific Button instance.
- Web props map to a native HTML button. Native props map to a SwiftUI Button
  action and view content; platform APIs are not forced into identical types.
- A Button is enabled or disabled. There is no busy/loading state in this
  feature; the approved reference does not define one.
- Content arrangement is one of: label only, leading icon with label, label
  with trailing icon, both icons with label, or icon-only.
- Icon-only arrangement has a required accessible name. Visible labels provide
  the accessible name by default unless the consumer supplies a platform-native
  override.