# Contract: iOS Typography Projection

## Source and Output

- Source of truth remains `packages/tokens/src/tokens/type.ts`; no separate
  Swift typography values are authored.
- The tokens generator continues to emit existing `DesignSystemTokens` base
  constants and additionally emits a typed native descriptor for each type
  token into the existing `DesignSystemTokens` target.
- The supported initial role set is `display`, `h1`, `h2`, `h3`, `h4`, `p`,
  `p-sm`, `label`, `caption`, and `overline`.
- Descriptors include the role/token key, font face, point size, weight,
  line-height multiplier, and Dynamic Type reference style.
- CSS `rem` values convert using a 16-point root; unitless CSS line-height is
  emitted as a positive multiplier. CSS weights map to the exact bundled face.
- The generated Swift API exposes typed lookup by role and does not expose
  CSS shorthand parsing to runtime consumers.

## Font Resources

- The token package owns source font files and their license notices because
  font family is part of the type-token decision.
- The token build copies required font files into
  `packages/tokens/dist/ios/DesignSystemTokens/Fonts/`.
- The existing `DesignSystemTokens` target declares that folder as a SwiftPM
  resource; resource access uses its module resource bundle, not an assumed
  app bundle path.
- The package exposes a registration/access helper for consumers. Missing or
  invalid resources fail native validation and must not silently fall back to
  system fonts.
- Only font families and weights referenced by the current type tokens are
  included. License and attribution text travels with the resources.

## Generation and Failure Contract

- Identical TypeScript token inputs and font resources produce byte-identical
  generated Swift descriptors and resource copies.
- Each of the ten roles maps to exactly one existing token key.
- Unsupported shorthand syntax, absent required weights/families, duplicate
  generated identifiers, or missing font assets cause a non-zero generation
  result before partially replacing the generated output.
- Token contract tests verify role names, converted values, generated API
  declarations, deterministic output, and the presence of required resources.
- Native tests verify each role resolves to a registered font descriptor and
  that Dynamic Type scaling and line-height behavior are applied.
