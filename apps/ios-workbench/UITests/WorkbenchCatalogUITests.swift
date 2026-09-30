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

    func testPlaygroundFullWidthToggleWidensThePreviewButton() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.navigationBars["Components"].waitForExistence(timeout: 10))
        let buttonRow = app.descendants(matching: .any)["catalog-components.button"]
        XCTAssertTrue(buttonRow.waitForExistence(timeout: 5), app.debugDescription)
        buttonRow.tap()

        let preview = app.buttons["button-playground-preview"]
        XCTAssertTrue(preview.waitForExistence(timeout: 5))
        let compactWidth = preview.frame.width

        app.switches["playground-full-width"].tap()
        let fullWidth = preview.frame.width
        XCTAssertGreaterThan(fullWidth, compactWidth)
    }

    func testButtonActivatesWhenEnabledAndNotWhenDisabled() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.navigationBars["Components"].waitForExistence(timeout: 10))
        let buttonRow = app.descendants(matching: .any)["catalog-components.button"]
        XCTAssertTrue(buttonRow.waitForExistence(timeout: 5), app.debugDescription)
        buttonRow.tap()

        let enabledButton = app.buttons["Tap me"]
        XCTAssertTrue(enabledButton.waitForExistence(timeout: 5))
        enabledButton.tap()
        XCTAssertTrue(app.staticTexts["Tap count: 1"].waitForExistence(timeout: 5))

        let disabledButton = app.buttons["Disabled"]
        XCTAssertTrue(disabledButton.exists)
        XCTAssertFalse(disabledButton.isEnabled)
        disabledButton.tap()
        XCTAssertTrue(app.staticTexts["Tap count: 1"].exists)
    }
}
