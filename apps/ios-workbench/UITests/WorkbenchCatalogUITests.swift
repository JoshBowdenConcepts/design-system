import XCTest

final class WorkbenchCatalogUITests: XCTestCase {
    func testCatalogOpensExampleAndPreviewUpdates() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.navigationBars["Components"].waitForExistence(timeout: 10))
        let example = app.descendants(matching: .any)["catalog-components.text.display"]
        XCTAssertTrue(example.waitForExistence(timeout: 5), app.debugDescription)
        example.tap()

        let field = app.textFields["example-content"]
        XCTAssertTrue(field.waitForExistence(timeout: 5))
        field.tap()
        field.press(forDuration: 1.1)
        app.menuItems["Select All"].tap()
        field.typeText("Updated preview")
        XCTAssertTrue(app.staticTexts["Updated preview"].exists)
    }
}
