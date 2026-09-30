import DesignSystemTokens
import SwiftUI

public enum ButtonVariant: String, CaseIterable, Identifiable {
    case solid, outline, text
    public var id: String { rawValue }
}

public enum ButtonSize: String, CaseIterable, Identifiable {
    case sm, md
    public var id: String { rawValue }
}

public enum ButtonContentAlignment: String, CaseIterable, Identifiable {
    case center
    case spaceBetween = "space-between"
    public var id: String { rawValue }
}

/// A design-system Button. Two initializers mirror the web contract: a
/// labeled button (accessible name comes from its visible text) and an
/// icon-only button, which requires a non-empty accessibility label — there
/// is no way to construct an icon-only button without one (FR-016).
public struct DesignSystemButton: View {
    private let title: String?
    private let accessibilityLabelOverride: String?
    private let variant: ButtonVariant
    private let size: ButtonSize
    private let fullWidth: Bool
    private let contentAlignment: ButtonContentAlignment
    private let leadingIcon: AnyView?
    private let trailingIcon: AnyView?
    private let action: () -> Void

    public init(
        _ title: String,
        variant: ButtonVariant = .solid,
        size: ButtonSize = .md,
        fullWidth: Bool = false,
        contentAlignment: ButtonContentAlignment = .center,
        leadingIcon: AnyView? = nil,
        trailingIcon: AnyView? = nil,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.accessibilityLabelOverride = nil
        self.variant = variant
        self.size = size
        self.fullWidth = fullWidth
        self.contentAlignment = contentAlignment
        self.leadingIcon = leadingIcon
        self.trailingIcon = trailingIcon
        self.action = action
    }

    /// Icon-only construction. `accessibilityLabel` is required — there is no
    /// overload that omits it, so an icon-only button cannot be built without
    /// a non-empty accessible name.
    public init(
        iconOnlyAccessibilityLabel accessibilityLabel: String,
        variant: ButtonVariant = .solid,
        size: ButtonSize = .md,
        icon: AnyView,
        action: @escaping () -> Void
    ) {
        precondition(
            !accessibilityLabel.isEmpty,
            "DesignSystemButton: an icon-only button requires a non-empty accessibility label."
        )
        self.title = nil
        self.accessibilityLabelOverride = accessibilityLabel
        self.variant = variant
        self.size = size
        self.fullWidth = false
        self.contentAlignment = .center
        self.leadingIcon = icon
        self.trailingIcon = nil
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            content
                .frame(maxWidth: fullWidth ? .infinity : nil)
        }
        .buttonStyle(
            DesignSystemButtonStyle(variant: variant, size: size, isIconOnly: title == nil)
        )
        .accessibilityLabel(accessibilityLabelOverride ?? title ?? "")
    }

    /// Present slots (leading icon, label, trailing icon), in order — omitting
    /// whichever are `nil` rather than reserving space for them.
    private var contentItems: [AnyView] {
        var items: [AnyView] = []
        if let leadingIcon { items.append(leadingIcon) }
        if let title { items.append(AnyView(DesignSystemText(title, role: .label))) }
        if let trailingIcon { items.append(trailingIcon) }
        return items
    }

    @ViewBuilder
    private var content: some View {
        let items = contentItems
        if fullWidth, contentAlignment == .spaceBetween, items.count > 1 {
            HStack(spacing: 0) {
                ForEach(items.indices, id: \.self) { index in
                    items[index]
                    if index < items.count - 1 {
                        Spacer(minLength: DesignSystemTokens.space50)
                    }
                }
            }
        } else {
            HStack(spacing: DesignSystemTokens.space50) {
                ForEach(items.indices, id: \.self) { index in items[index] }
            }
        }
    }
}

private struct ButtonStyleColors {
    let background: Color
    let foreground: Color
    let border: Color
}

private struct DesignSystemButtonStyle: ButtonStyle {
    let variant: ButtonVariant
    let size: ButtonSize
    let isIconOnly: Bool

    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        let colors = resolvedColors(isPressed: configuration.isPressed)
        configuration.label
            .padding(padding)
            .frame(minWidth: DesignSystemTokens.space300, minHeight: DesignSystemTokens.space300)
            .background(colors.background)
            .foregroundStyle(colors.foreground)
            .overlay(
                RoundedRectangle(cornerRadius: DesignSystemTokens.radius200)
                    .stroke(colors.border, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: DesignSystemTokens.radius200))
    }

    private var padding: EdgeInsets {
        if isIconOnly { return EdgeInsets() }
        switch size {
        case .sm:
            return EdgeInsets(
                top: DesignSystemTokens.space50,
                leading: DesignSystemTokens.space150,
                bottom: DesignSystemTokens.space50,
                trailing: DesignSystemTokens.space150
            )
        case .md:
            return EdgeInsets(
                top: DesignSystemTokens.space100,
                leading: DesignSystemTokens.space200,
                bottom: DesignSystemTokens.space100,
                trailing: DesignSystemTokens.space200
            )
        }
    }

    private func resolvedColors(isPressed: Bool) -> ButtonStyleColors {
        if !isEnabled {
            switch variant {
            case .solid:
                return ButtonStyleColors(
                    background: DesignSystemTokens.colorBgSunken,
                    foreground: DesignSystemTokens.colorTextTertiary,
                    border: .clear
                )
            case .outline:
                return ButtonStyleColors(
                    background: .clear,
                    foreground: DesignSystemTokens.colorTextTertiary,
                    border: DesignSystemTokens.colorBorder
                )
            case .text:
                return ButtonStyleColors(
                    background: .clear,
                    foreground: DesignSystemTokens.colorTextTertiary,
                    border: .clear
                )
            }
        }
        if isPressed {
            switch variant {
            case .solid:
                return ButtonStyleColors(
                    background: DesignSystemTokens.colorTextPrimary,
                    foreground: DesignSystemTokens.colorBgRaised,
                    border: .clear
                )
            case .outline:
                return ButtonStyleColors(
                    background: DesignSystemTokens.colorPrimarySubtle,
                    foreground: DesignSystemTokens.colorPrimaryHover,
                    border: DesignSystemTokens.colorPrimaryHover
                )
            case .text:
                return ButtonStyleColors(
                    background: DesignSystemTokens.colorPrimarySubtle,
                    foreground: DesignSystemTokens.colorPrimaryHover,
                    border: .clear
                )
            }
        }
        switch variant {
        case .solid:
            return ButtonStyleColors(
                background: DesignSystemTokens.colorPrimary,
                foreground: DesignSystemTokens.colorOnPrimary,
                border: .clear
            )
        case .outline:
            return ButtonStyleColors(
                background: .clear,
                foreground: DesignSystemTokens.colorPrimary,
                border: DesignSystemTokens.colorPrimary
            )
        case .text:
            return ButtonStyleColors(
                background: .clear,
                foreground: DesignSystemTokens.colorPrimary,
                border: .clear
            )
        }
    }
}
