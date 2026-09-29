import DesignSystemComponents
import DesignSystemTokens
import XCTest

final class TextTokenIntegrationTests: XCTestCase {
    func testTextRolesUseGeneratedTokenDescriptors() {
        XCTAssertEqual(TextRole.display.typography.pointSize, DesignSystemTypographyTokens.display.pointSize)
        XCTAssertEqual(TextRole.h1.typography.fontName, DesignSystemTypographyTokens.h1.fontName)
        XCTAssertEqual(TextRole.h2.typography.weight, DesignSystemTypographyTokens.h2.weight)
        XCTAssertEqual(TextRole.h3.typography.lineHeightMultiplier, DesignSystemTypographyTokens.h3.lineHeightMultiplier)
        XCTAssertEqual(TextRole.h4.typography.fontName, DesignSystemTypographyTokens.h4.fontName)
        XCTAssertEqual(TextRole.p.typography.pointSize, DesignSystemTypographyTokens.p.pointSize)
        XCTAssertEqual(TextRole.pSm.typography.lineHeightMultiplier, DesignSystemTypographyTokens.pSm.lineHeightMultiplier)
        XCTAssertEqual(TextRole.label.typography.weight, DesignSystemTypographyTokens.label.weight)
        XCTAssertEqual(TextRole.caption.typography.fontName, DesignSystemTypographyTokens.caption.fontName)
        XCTAssertEqual(TextRole.overline.typography.pointSize, DesignSystemTypographyTokens.overline.pointSize)
    }
}
