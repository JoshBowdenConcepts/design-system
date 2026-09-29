# Research: iOS Component Workbench

**Date**: 2026-09-29
**Status**: Complete; no unresolved technical clarifications

## Decisions

### D1. Use a local SwiftUI app as the native catalog host

**Decision**: Add `apps/ios-workbench` as an Xcode iOS app that consumes the existing root Swift package by local path. Use SwiftUI navigation and an in-app component example catalog; do not add an iOS package under `packages/` or a separate preview framework.

**Rationale**: The root package already exports tokens, icons, and components as local SwiftPM products, and `xcodebuild` plus an iOS 26.5 Simulator runtime are available. An app gives examples real simulator behavior while preserving the constitution's three package layers. Apple documents developing a Swift package in tandem with an app through a local package dependency.

**Alternatives considered**: Xcode SwiftUI previews alone do not provide a browsable catalog or a repeatable launch target. A fourth `packages/` preview package violates the repository's exact three-layer architecture. A web-based simulator would not exercise native SwiftUI behavior.

### D2. Keep component sources in the existing components layer

**Decision**: Author public SwiftUI components under `packages/components/src/ios/`; have the existing components generator copy these authored sources into `dist/ios/DesignSystemComponents/` alongside its generated package entry/stub. Expose a native `DesignSystemText` component with a typed `TextRole` enum corresponding to web variants; do not reproduce the web `as` polymorphism because it represents HTML element selection.

**Rationale**: The components package already owns the `DesignSystemComponents` SwiftPM target and depends on tokens/icons in the allowed direction. Keeping authored source separate from generated output preserves reproducibility and avoids a new shippable layer. A namespaced native component avoids ambiguity with SwiftUI's `Text` type.

**Alternatives considered**: Authoring directly under generated `dist/` would lose source during builds; putting SwiftUI implementation in the app would prevent reuse by consumers of the components product.

### D3. Project the existing type tokens into typed native typography descriptors

**Decision**: Extend the tokens generator to parse the repository's current typography token representation and emit typed Swift descriptors for all ten roles, including point size, weight, family/PostScript face, and line-height multiplier. Keep existing `String` base token constants for compatibility. Reject malformed or unsupported typography shorthand before writing outputs. Components consume the generated descriptor rather than authoring duplicate style values.

**Rationale**: `packages/tokens/src/tokens/type.ts` is the existing source of truth, but its values are web CSS `font` shorthands; `Tokens.swift` currently emits only those base values as strings. SwiftUI needs a usable native font and line-height representation. A deterministic generator projection converts one source into platform-appropriate values and can be contract-tested.

**Alternatives considered**: Reauthoring numeric Swift constants would fork the design decisions. Runtime parsing of CSS shorthands in the iOS component would add consumer complexity and defer authoring errors until runtime. Replacing the shared schema with platform-specific fields is a larger migration than this feature needs; revisit only if the supported token grammar outgrows deterministic projection.

### D4. Bundle the shared typefaces as token-package resources

**Decision**: Add the required licensed font files and license notices under token package source resources; the token build copies them into `dist/ios/DesignSystemTokens/Fonts`. Declare the generated font folder as a resource of the existing SwiftPM token target and expose a public registration/access helper using that module's resource bundle. Use the exact family faces/weights called for by the current type tokens.

**Rationale**: The web stylesheet loads Bricolage Grotesque, Public Sans, and IBM Plex Mono remotely; relying on a network font download in the native preview would make rendering non-deterministic and could substitute incorrect system fonts. Apple requires package resources to be declared and accessed through `Bundle.module`, and supports public resource accessors. The font license and source must be checked in with the assets.

**Alternatives considered**: System-font substitutions would not reproduce the shared family decisions. Downloading fonts at app runtime would make previews network-dependent and non-reproducible. App-only font copies would put token-owned assets outside the shared token package.

### D5. Scale custom fonts with native accessibility text styles

**Decision**: Use SwiftUI custom fonts based on the generated point sizes and associate each role with an appropriate native text style for Dynamic Type scaling. Apply the generated line-height multiplier through native line spacing. The workbench and public component preserve native accessibility semantics; no HTML element abstraction is introduced.

**Rationale**: Apple's `Font.custom(_:size:relativeTo:)` scales custom typefaces relative to a semantic text style (available before the validated iOS 15 minimum). This retains the font-family source while responding to user text-size settings. Platform line metrics can differ, so parity is measured as shared role/family/weight/size intent, with native layout behavior retained.

**Alternatives considered**: Fixed-size custom fonts do not scale with Dynamic Type. System-only fonts lose the specified type families. Applying CSS-like markup semantics to SwiftUI would not provide useful native behavior.

### D6. Enforce native visual regression in an app-hosted test target

**Decision**: Add `pointfreeco/swift-snapshot-testing` only to the workbench test target and keep UI workflow tests in the Xcode app's UI test target. Commit deterministic reference images for the Text role gallery and workbench catalog, using a pinned simulator device/runtime configuration. Keep component API/token mapping assertions in XCTest without snapshot machinery.

**Rationale**: The constitution requires visual regression to gate rendered component changes. SnapshotTesting supports SwiftUI views, simulator/device configurations, image diffing, and XCTest, and is test-only so it does not become a shipped package dependency. The test target is the appropriate consumer; app-hosted UI tests also verify catalog navigation and accessibility.

**Alternatives considered**: Capturing screenshots as non-asserting test attachments does not gate visual changes. Hand-rolling pixel comparison adds image encoding, diff, and baseline-management code. Putting the snapshot dependency in the production components target would expand the shipped runtime surface unnecessarily.

### D7. Treat missing native prerequisites and missing token resources as explicit failures

**Decision**: Document macOS, Xcode command-line tools, an installed iOS Simulator runtime, and a completed token/component generation step as prerequisites. Fail the build/test when required generated typography or bundled font resources are absent; show an actionable workbench empty/error state if the catalog has no entries.

**Rationale**: The root SwiftPM package currently points into gitignored generated `dist/` directories and only resolves after `pnpm build`. Failing visibly prevents an incorrect system-font fallback from masquerading as a valid preview and makes setup repairable.

**Alternatives considered**: Silently falling back to system type would conceal generation failures and violate the shared-source contract. Checking in generated `dist/` artifacts conflicts with the repository's generated-output policy.

## Evidence and Repository Findings

- `packages/tokens/src/tokens/type.ts` defines ten roles: `display`, `h1`, `h2`, `h3`, `h4`, `p`, `p-sm`, `label`, `caption`, and `overline`; each value is a CSS font shorthand string.
- `packages/tokens/src/generate.ts` currently emits `Tokens.swift` with base values only, using `String` for typography tokens.
- `packages/components/src/Text.tsx` defines those same ten variants. Its web-only `as` contract selects HTML elements and does not directly map to SwiftUI.
- Root `Package.swift` contains exactly three products and targets. Their generated source paths are in `packages/*/dist/ios/` and are ignored by git.
- `pnpm build && swift package describe` succeeds and reports all three current products/targets.
- Xcode 27.0, Swift 6.4, and iOS Simulator runtime 26.5 with available iPhone/iPad devices are installed in the current environment.
- No font files are currently present in the repository.
- Apple SwiftUI documentation states `Font.custom(_:size:relativeTo:)` scales against a native text style and is available on iOS 14 and later.
- Apple Swift Package Manager documentation recommends explicitly declaring package resources and accessing them through `Bundle.module`.
- Swift Snapshot Testing supports SwiftUI and XCTest snapshots and recommends recording/comparing against the same simulator configuration to avoid image drift.

## References

- [Apple: Bundling resources with a Swift package](https://developer.apple.com/documentation/xcode/bundling-resources-with-a-swift-package)
- [Apple: Font.custom(\_:size:relativeTo:)](<https://developer.apple.com/documentation/swiftui/font/custom(_:size:relativeto:)>)
- [Point-Free: swift-snapshot-testing](https://github.com/pointfreeco/swift-snapshot-testing)
