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
}