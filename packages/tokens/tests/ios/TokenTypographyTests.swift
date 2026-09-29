import XCTest
import UIKit
import DesignSystemTokens

final class TokenTypographyTests: XCTestCase {
    func testAllGeneratedTypographyRolesHaveBundledFaces() throws {
        let descriptors = [
            DesignSystemTypographyTokens.display,
            DesignSystemTypographyTokens.h1,
            DesignSystemTypographyTokens.h2,
            DesignSystemTypographyTokens.h3,
            DesignSystemTypographyTokens.h4,
            DesignSystemTypographyTokens.p,
            DesignSystemTypographyTokens.pSm,
            DesignSystemTypographyTokens.label,
            DesignSystemTypographyTokens.caption,
            DesignSystemTypographyTokens.overline,
        ]
        XCTAssertEqual(descriptors.count, 10)
        try DesignSystemTokenFonts.register()
        for descriptor in descriptors {
            XCTAssertTrue(try DesignSystemTokenFonts.url(forPostScriptName: descriptor.fontName).isFileURL)
            XCTAssertNotNil(UIFont(name: descriptor.fontName, size: 12), descriptor.fontName)
        }
    }

    func testMissingPostScriptFaceFailsExplicitly() throws {
        try DesignSystemTokenFonts.register()
        XCTAssertThrowsError(try DesignSystemTokenFonts.url(forPostScriptName: "UnknownFace"))
    }
}
