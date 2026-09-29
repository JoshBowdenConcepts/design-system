import XCTest
@testable import iOSComponentWorkbench

final class WorkbenchCatalogTests: XCTestCase {
    func testCatalogHasUniqueIDsAndNonEmptyTitles() {
        let examples = ComponentCatalog.validatedExamples
        XCTAssertEqual(Set(examples.map(\.id)).count, examples.count)
        XCTAssertTrue(examples.allSatisfy { !$0.title.isEmpty })
        XCTAssertEqual(examples.map(\.id), examples.map(\.id).sorted())
    }
}
