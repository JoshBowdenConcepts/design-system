# Contract: iOS Workbench Catalog

## Host App

- The workbench is a local iOS application under `apps/ios-workbench` and
  consumes the repo-root `design-system` Swift package by local path.
- It is a development app only; it is not published as a fourth package layer.
- The initial screen exposes a named, navigable catalog of component examples.
- Selecting an example shows a native SwiftUI preview and its supported inputs.
- The initial catalog contains one independently selectable Text example for
  each Text role in [ios-typography.md](./ios-typography.md).
- A developer can edit preview content and select another Text role without
  editing source or rebuilding the app.
- An empty catalog or unavailable generated package data is shown as a clear
  empty/error state, never as a valid-looking preview.

## Component Example Contract

Each catalog entry has a stable unique identifier, a non-empty title, a
component kind, editable initial content, and optional typed role inputs. The
catalog validates identifier uniqueness and preserves deterministic display
ordering. The detail view renders by component kind and forwards typed values;
catalog entries do not store executable view closures or use stringly typed
reflection.

## Native Text API

- The public SwiftUI component is `DesignSystemText` in the existing
  `DesignSystemComponents` product.
- It accepts display content and a `TextRole`, defaulting to the paragraph/body
  role (`p`).
- `TextRole` contains `display`, `h1`, `h2`, `h3`, `h4`, `p`, `pSm`, `label`,
  `caption`, and `overline` cases. The `pSm` case maps exactly to token key
  `type.p-sm`.
- The component preserves SwiftUI Text behavior and accessibility semantics.
  Web's `as` HTML-element prop is not part of the native contract.
- Font family, size, weight, and line-height come from the generated descriptor;
  the component owns no duplicate typography values.
- Typography scales for Dynamic Type using its mapped native text style.

## Development Workflow

- `pnpm build` generates token and component Swift package sources/resources.
- Xcode opens and runs `apps/ios-workbench/iOSComponentWorkbench.xcodeproj` on
  an installed iOS Simulator device.
- The root Swift package must resolve after generation; the app uses its local
  package product and does not require publishing or installing a package.
- Documentation identifies macOS, Xcode, and an iOS Simulator runtime as
  prerequisites and gives actionable recovery steps for missing prerequisites
  or generated data.
