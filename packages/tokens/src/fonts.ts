/**
 * Web font loading. Emitted as `@import` lines at the very top of
 * `dist/web/tokens.css` (right after the header comment, before any rule), so
 * every family named in `src/tokens/type.ts` is available wherever the
 * stylesheet is loaded — no separate `<link>` or bundler font config needed.
 *
 * Google Fonts, `display=swap`. Keep the family list in sync with `type.ts`:
 *   - Bricolage Grotesque  400 / 600 / 800  (display, h1, h2)
 *   - Public Sans          400 / 500 / 700  (h3–caption)
 *   - IBM Plex Mono        400 / 500        (overline)
 */
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  "family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&" +
  "family=IBM+Plex+Mono:wght@400;500&" +
  "family=Public+Sans:wght@400;500;700&" +
  "display=swap";

/** Lines emitted verbatim above the first CSS block. */
export const fontImports: readonly string[] = [`@import url("${GOOGLE_FONTS_HREF}");`];
