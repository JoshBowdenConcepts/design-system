import DesignSystemTokens
import SwiftUI

/// Non-heading, non-display `TextRole` counterparts — the only sizes Link may
/// use (FR-006). `nil` inherits the ambient font (D3), the same role `Text`'s
/// `span` default plays on web.
public enum LinkSize: String, CaseIterable, Identifiable {
    case p
    case pSm = "p-sm"
    case label
    case caption

    public var id: String { rawValue }

    public var textRole: TextRole {
        switch self {
        case .p: .p
        case .pSm: .pSm
        case .label: .label
        case .caption: .caption
        }
    }
}

/// A design-system Link. `destination` is the sole determinant of
/// availability (D7): a non-`nil` URL renders a pressable, underlined control
/// that opens it; `nil` renders de-emphasized, non-interactive text with no
/// `.isLink` trait — there is no separate `disabled` option.
public struct DesignSystemLink: View {
    public let title: String
    public let destination: URL?
    public let size: LinkSize?
    public let standalone: Bool
    public let external: Bool
    private let accessibilityLabelOverride: String?

    public init(
        _ title: String,
        destination: URL?,
        size: LinkSize? = nil,
        standalone: Bool = false,
        external: Bool = false,
        accessibilityLabelOverride: String? = nil
    ) {
        self.title = title
        self.destination = destination
        self.size = size
        self.standalone = standalone
        self.external = external
        self.accessibilityLabelOverride = accessibilityLabelOverride
    }

    public var body: some View {
        if let destination {
            InteractiveLink(
                title: title,
                destination: destination,
                size: size,
                standalone: standalone,
                external: external,
                accessibilityLabelOverride: accessibilityLabelOverride
            )
        } else {
            UnavailableLink(title: title, size: size)
        }
    }
}

/// Builds the shared label `Text` from a `LinkSize?` — `nil` inherits the
/// ambient font (no `.font()` override), matching `Text`'s `span` default.
/// Returns `Text` (not `some View`) so callers can keep chaining `Text`-only
/// modifiers like `.underline()`; unlike paragraph copy, Link content is
/// expected to stay on one line, so no `.lineSpacing()` override is needed.
private func linkLabelText(_ title: String, size: LinkSize?) -> Text {
    guard let size else { return Text(title) }
    let typography = size.textRole.typography
    return Text(title)
        .font(.custom(typography.fontName, size: typography.pointSize, relativeTo: size.textRole.dynamicTypeStyle))
}

private func linkLabelPointSize(_ size: LinkSize?) -> CGFloat {
    size?.textRole.typography.pointSize ?? DesignSystemTypographyTokens.p.pointSize
}

/// The same-context and external destination states (FR-011/FR-012):
/// pressable, always underlined, token-colored, and corrected to expose
/// `.isLink` rather than `.isButton` to assistive technology (D8).
private struct InteractiveLink: View {
    let title: String
    let destination: URL
    let size: LinkSize?
    let standalone: Bool
    let external: Bool
    let accessibilityLabelOverride: String?

    @Environment(\.openURL) private var openURL

    var body: some View {
        Button {
            openURL(destination)
        } label: {
            content
        }
        .buttonStyle(LinkButtonStyle(standalone: standalone))
        .accessibilityAddTraits(.isLink)
        .accessibilityRemoveTraits(.isButton)
        .accessibilityLabel(accessibilityLabel)
    }

    private var accessibilityLabel: String {
        let base = accessibilityLabelOverride ?? title
        return external ? "\(base), opens in Safari" : base
    }

    @ViewBuilder
    private var content: some View {
        HStack(spacing: DesignSystemTokens.space50) {
            linkLabelText(title, size: size).underline()
            if external {
                // Hidden from VoiceOver, same as the web `aria-hidden` glyph —
                // the new-context fact is carried by `accessibilityLabel`
                // instead (D6).
                Text("↗")
                    .font(.system(size: linkLabelPointSize(size)))
                    .accessibilityHidden(true)
            }
        }
    }
}

private struct LinkButtonStyle: ButtonStyle {
    let standalone: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundStyle(configuration.isPressed ? DesignSystemTokens.colorPrimaryHover : DesignSystemTokens.colorPrimary)
            .frame(
                minWidth: standalone ? DesignSystemTokens.space300 : nil,
                minHeight: standalone ? DesignSystemTokens.space300 : nil
            )
            .contentShape(Rectangle())
    }
}

/// The unavailable destination state (FR-013/D7): plain, de-emphasized text
/// with no interactive wrapper, so it exposes no `.isLink` trait and is
/// skipped by VoiceOver swipe navigation and Full Keyboard Access.
///
/// Uses `colorTextSecondary`, not the reference's literal `colorTextTertiary`
/// — tertiary only reaches ~4.29:1 against the page background in light mode,
/// below the 4.5:1 AA floor (1.4.3) for normal text, and unlike Button's
/// *disabled* state this static text is not an inactive component exempt
/// from that rule. See `Link.module.css` and `design-reference.md`.
private struct UnavailableLink: View {
    let title: String
    let size: LinkSize?

    var body: some View {
        linkLabelText(title, size: size)
            .foregroundStyle(DesignSystemTokens.colorTextSecondary)
    }
}
