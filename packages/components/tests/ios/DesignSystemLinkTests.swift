import DesignSystemComponents
import DesignSystemTokens
import SwiftUI
import XCTest

/// Construction-level and property-introspection coverage, the same pattern
/// `DesignSystemButtonTests` uses: SwiftUI exposes no public API to synthesize
/// a tap or read back `@Environment(\.openURL)` outside of a running app, so
/// real activation is verified where this repo already verifies real
/// interaction — a UI test against the running workbench, same as Button.
final class DesignSystemLinkTests: XCTestCase {
    private let destination = URL(string: "https://example.com")!

    func testAllSizesMapToTheirTextRoleCounterpart() {
        XCTAssertEqual(LinkSize.allCases.count, 4)
        XCTAssertEqual(LinkSize.p.textRole, .p)
        XCTAssertEqual(LinkSize.pSm.textRole, .pSm)
        XCTAssertEqual(LinkSize.label.textRole, .label)
        XCTAssertEqual(LinkSize.caption.textRole, .caption)
    }

    func testConstructsWithNoSizeToInheritTheAmbientFont() {
        let link = DesignSystemLink("Read the docs", destination: destination)
        XCTAssertNil(link.size)
        XCTAssertEqual(link.title, "Read the docs")
        XCTAssertEqual(link.destination, destination)
    }

    func testConstructsAtEachExplicitSizeWithoutTrapping() {
        for size in LinkSize.allCases {
            let link = DesignSystemLink("Read the docs", destination: destination, size: size)
            XCTAssertEqual(link.size, size)
        }
    }

    func testDefaultsToInlineNotStandaloneAndNotExternal() {
        let link = DesignSystemLink("Read the docs", destination: destination)
        XCTAssertFalse(link.standalone)
        XCTAssertFalse(link.external)
    }

    func testConstructsStandaloneAtEachExplicitSizeWithoutTrapping() {
        for size in LinkSize.allCases {
            let link = DesignSystemLink("View all projects", destination: destination, size: size, standalone: true)
            XCTAssertTrue(link.standalone)
        }
    }

    func testStandaloneDefaultsToFalse() {
        let link = DesignSystemLink("View all projects", destination: destination)
        XCTAssertFalse(link.standalone)
    }

    func testExternalDefaultsToFalse() {
        let link = DesignSystemLink("Status page", destination: destination)
        XCTAssertFalse(link.external)
    }

    func testConstructsExternalWithoutTrapping() {
        let link = DesignSystemLink("Status page", destination: destination, external: true)
        XCTAssertTrue(link.external)
        XCTAssertEqual(link.title, "Status page")
    }

    func testNilDestinationIsTheSoleUnavailableSignal() {
        // There is no separate `disabled` option (FR-013/D7) — a `nil`
        // destination is the only way to express "unavailable", and the view
        // itself (not a flag) decides to render the non-interactive
        // presentation with no `.isLink` trait.
        let link = DesignSystemLink("Link text", destination: nil)
        XCTAssertNil(link.destination)
    }

    func testConstructsUnavailableAtEachExplicitSizeWithoutTrapping() {
        for size in LinkSize.allCases {
            _ = DesignSystemLink("Link text", destination: nil, size: size)
        }
    }
}
