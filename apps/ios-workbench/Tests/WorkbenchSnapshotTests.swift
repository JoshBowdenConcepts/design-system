import SnapshotTesting
import SwiftUI
import XCTest
@testable import iOSComponentWorkbench

final class WorkbenchSnapshotTests: XCTestCase {
    func testCatalogSnapshot() {
        let view = UIHostingController(rootView: ComponentCatalogView())
        assertSnapshot(of: view, as: .image(on: .iPhoneSe(.portrait)))
    }

    func testTextRoleGallerySnapshot() {
        let view = UIHostingController(rootView: TextRoleGalleryView())
        assertSnapshot(of: view, as: .image(on: .iPhoneSe(.portrait)))
    }

    func testButtonGallerySnapshot() {
        // The gallery's content is taller than one phone screen; a device
        // preset would silently clip everything below the fold (the exact
        // full-width and icon-only rows this snapshot exists to catch). A
        // custom, generously tall config captures the whole scrollable
        // content instead.
        let tallPortrait = ViewImageConfig(
            safeArea: .zero,
            size: CGSize(width: 375, height: 2200),
            traits: ViewImageConfig.iPhoneSe(.portrait).traits
        )
        let view = UIHostingController(rootView: ButtonGalleryView())
        assertSnapshot(of: view, as: .image(on: tallPortrait))
    }
}