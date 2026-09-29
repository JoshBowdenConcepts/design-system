import XCTest
import UIKit
import DesignSystemComponents
import DesignSystemTokens

final class DesignSystemTextTests: XCTestCase {
    func testEveryRoleMapsToItsGeneratedTypographyDescriptor() {
        XCTAssertEqual(TextRole.allCases.count, 10)
        XCTAssertEqual(TextRole.pSm.typography.pointSize, DesignSystemTypographyTokens.pSm.pointSize)
        XCTAssertEqual(TextRole.overline.typography.fontName, DesignSystemTypographyTokens.overline.fontName)
    }

    func testDefaultRoleIsParagraph() {
        let text = DesignSystemText("Example")
        XCTAssertEqual(text.role, .p)
        XCTAssertEqual(text.content, "Example")
    }

    func testFontResourcesRegisterWithoutFallback() throws {
        try DesignSystemTokenFonts.register()
        for role in TextRole.allCases {
            _ = try DesignSystemTokenFonts.url(forPostScriptName: role.typography.fontName)
            XCTAssertNotNil(UIFont(name: role.typography.fontName, size: 12), role.rawValue)
        }
    }
}