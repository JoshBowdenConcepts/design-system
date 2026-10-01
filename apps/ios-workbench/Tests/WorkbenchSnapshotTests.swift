import SnapshotTesting
import SwiftUI
import XCTest
@testable import iOSComponentWorkbench

final class WorkbenchSnapshotTests: XCTestCase {
    func testCatalogSnapshot() {
        let view = UIHostingController(rootView: ComponentCatalogView())
        assertSnapshot(of: view, as: .image(on: .iPhoneSe(.portrait)))
    }

    func testTextGallerySnapshot() {
        let view = UIHostingController(rootView: TextGalleryView())
        assertSnapshot(of: view, as: .image(on: Self.tallPortrait(height: 1200)))
    }

    func testButtonGallerySnapshot() {
        let view = UIHostingController(rootView: ButtonGalleryView())
        assertSnapshot(of: view, as: .image(on: Self.tallPortrait(height: 2200)))
    }

    func testLinkGallerySnapshot() {
        let view = UIHostingController(rootView: LinkGalleryView())
        assertSnapshot(of: view, as: .image(on: Self.tallPortrait(height: 1800)))
    }

    /// The galleries are taller than one phone screen; a device preset would
    /// silently clip everything below the fold (the exact full-width, icon-only
    /// and smaller-role rows these snapshots exist to catch). A custom,
    /// generously tall config captures the whole scrollable content instead.
    private static func tallPortrait(height: CGFloat) -> ViewImageConfig {
        ViewImageConfig(
            safeArea: .zero,
            size: CGSize(width: 375, height: height),
            traits: ViewImageConfig.iPhoneSe(.portrait).traits
        )
    }
}
