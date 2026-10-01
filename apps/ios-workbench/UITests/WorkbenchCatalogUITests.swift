import XCTest

final class WorkbenchCatalogUITests: XCTestCase {
    func testCatalogOpensTextAndPreviewUpdates() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.navigationBars["Components"].waitForExistence(timeout: 10))
        let textRow = app.descendants(matching: .any)["catalog-components.text"]
        XCTAssertTrue(textRow.waitForExistence(timeout: 5), app.debugDescription)
        textRow.tap()

        let field = app.textFields["playground-content"]
        XCTAssertTrue(field.waitForExistence(timeout: 5))
        field.tap()
        field.press(forDuration: 1.1)
        app.menuItems["Select All"].tap()
        field.typeText("Updated preview")
        XCTAssertTrue(app.staticTexts["Updated preview"].firstMatch.exists)
    }

    func testTextPlaygroundRolePickerChangesThePreview() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.navigationBars["Components"].waitForExistence(timeout: 10))
        let textRow = app.descendants(matching: .any)["catalog-components.text"]
        XCTAssertTrue(textRow.waitForExistence(timeout: 5), app.debugDescription)
        textRow.tap()

        let preview = app.staticTexts["text-playground-preview"]
        XCTAssertTrue(preview.waitForExistence(timeout: 5))
        let paragraphHeight = preview.frame.height

        app.buttons["playground-role"].tap()
        app.buttons["display"].tap()
        XCTAssertGreaterThan(preview.frame.height, paragraphHeight)
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
