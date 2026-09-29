import DesignSystemTokens
import SwiftUI

public enum TextRole: String, CaseIterable, Identifiable {
    case display
    case h1
    case h2
    case h3
    case h4
    case p
    case pSm = "p-sm"
    case label
    case caption
    case overline

    public var id: String { rawValue }

    public var typography: DesignSystemTypography {
        switch self {
        case .display: DesignSystemTypographyTokens.display
        case .h1: DesignSystemTypographyTokens.h1
        case .h2: DesignSystemTypographyTokens.h2
        case .h3: DesignSystemTypographyTokens.h3
        case .h4: DesignSystemTypographyTokens.h4
        case .p: DesignSystemTypographyTokens.p
        case .pSm: DesignSystemTypographyTokens.pSm
        case .label: DesignSystemTypographyTokens.label
        case .caption: DesignSystemTypographyTokens.caption
        case .overline: DesignSystemTypographyTokens.overline
        }
    }

    var dynamicTypeStyle: Font.TextStyle {
        switch self {
        case .display: .largeTitle
        case .h1: .title
        case .h2: .title2
        case .h3: .title3
        case .h4: .headline
        case .p: .body
        case .pSm: .callout
        case .label: .subheadline
        case .caption: .footnote
        case .overline: .caption2
        }
    }
}

public struct DesignSystemText: View {
    public let content: String
    public let role: TextRole

    public init(_ content: String, role: TextRole = .p) {
        self.content = content
        self.role = role
    }

    public var body: some View {
        let typography = role.typography
        Text(content)
            .font(.custom(typography.fontName, size: typography.pointSize, relativeTo: role.dynamicTypeStyle))
            .lineSpacing(max(0, typography.pointSize * (typography.lineHeightMultiplier - 1)))
    }
}