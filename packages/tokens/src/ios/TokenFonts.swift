import CoreText
import Foundation

public enum DesignSystemTokenFonts {
    private static var registrationResult: Result<Void, Error>?

    public static func register() throws {
        if let registrationResult {
            return try registrationResult.get()
        }

        do {
            guard let urls = Bundle.module.urls(forResourcesWithExtension: "ttf", subdirectory: nil), !urls.isEmpty else {
                throw FontError.missingResources
            }
            for url in urls {
                var registrationError: Unmanaged<CFError>?
                guard CTFontManagerRegisterFontsForURL(url as CFURL, .process, &registrationError) else {
                    if let error = registrationError?.takeRetainedValue() {
                        throw error
                    }
                    throw FontError.registrationFailed(url.lastPathComponent)
                }
            }
            registrationResult = .success(())
        } catch {
            registrationResult = .failure(error)
            throw error
        }
    }

    public static func url(forPostScriptName name: String) throws -> URL {
        try register()
        guard let fonts = Bundle.module.urls(forResourcesWithExtension: "ttf", subdirectory: nil),
              !fonts.isEmpty else {
            throw FontError.missingResources
        }
        let familyPrefix: String
        if name.hasPrefix("BricolageGrotesque-") {
            familyPrefix = "BricolageGrotesque"
        } else if name.hasPrefix("PublicSansRoman-") {
            familyPrefix = "PublicSans"
        } else if name.hasPrefix("IBMPlexMono-") {
            familyPrefix = "IBMPlexMono"
        } else {
            throw FontError.postScriptNameNotFound(name)
        }
        guard let url = fonts.first(where: { $0.deletingPathExtension().lastPathComponent == familyPrefix || $0.deletingPathExtension().lastPathComponent.hasPrefix(familyPrefix) }) else {
            throw FontError.postScriptNameNotFound("\(name); resources: \(fonts.map(\.lastPathComponent))")
        }
        return url
    }

    public enum FontError: Error, LocalizedError {
        case missingResources
        case registrationFailed(String)
        case postScriptNameNotFound(String)

        public var errorDescription: String? {
            switch self {
            case .missingResources: "Design System font resources are missing"
            case .registrationFailed(let font): "Could not register font resource \(font)"
            case .postScriptNameNotFound(let name): "No bundled font resource matches PostScript face \(name)"
            }
        }
    }
}