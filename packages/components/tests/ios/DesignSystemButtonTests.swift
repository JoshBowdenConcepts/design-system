import DesignSystemComponents
import SwiftUI
import XCTest

/// Construction-level coverage only. SwiftUI's `Button` exposes no public API
/// to synthesize a tap or introspect environment values like `isEnabled`
/// outside of a running app, so actual activation/disabled behavior is
/// verified where this repo already verifies real interaction: a UI test
/// against the running workbench (`WorkbenchCatalogUITests`), the same
/// pattern used for the existing catalog/text-field flow.
final class DesignSystemButtonTests: XCTestCase {
    func testAllVariantsAndSizesConstructWithoutTrapping() {
        for variant in ButtonVariant.allCases {
            for size in ButtonSize.allCases {
                _ = DesignSystemButton("Action", variant: variant, size: size, action: {})
            }
        }
        XCTAssertEqual(ButtonVariant.allCases.count, 3)
        XCTAssertEqual(ButtonSize.allCases.count, 2)
    }

    func testSupportsCenterAndSpaceBetweenAlignmentWhenFullWidth() {
        _ = DesignSystemButton("Action", fullWidth: true, contentAlignment: .center, action: {})
        _ = DesignSystemButton("Action", fullWidth: true, contentAlignment: .spaceBetween, action: {})
    }

    func testSupportsAllFourLeadingTrailingIconCombinations() {
        let icon = AnyView(Image(systemName: "plus"))
        _ = DesignSystemButton("Action", action: {})
        _ = DesignSystemButton("Action", leadingIcon: icon, action: {})
        _ = DesignSystemButton("Action", trailingIcon: icon, action: {})
        _ = DesignSystemButton("Action", leadingIcon: icon, trailingIcon: icon, action: {})
    }

    func testIconOnlyConstructionRequiresAnAccessibilityLabelParameter() {
        // There is no icon-only initializer overload that omits the
        // accessibility label — the only way to construct one is to supply
        // it, which this call demonstrates. FR-016 is enforced by the type
        // signature itself, the same contract `Button.types.tsx` checks on
        // web via `@ts-expect-error`.
        let icon = AnyView(Image(systemName: "plus"))
        _ = DesignSystemButton(iconOnlyAccessibilityLabel: "Add item", icon: icon, action: {})
    }
}
