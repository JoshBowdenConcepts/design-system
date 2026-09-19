# CSS Module Build Contract

`packages/components/src/Text.module.css` is the source of Text styles. It
must be included in the published web output beside the emitted component
module as `dist/web/Text.module.css` (or an equivalent generated asset path
that the emitted import resolves to).

The module must contain token-based font declarations for element defaults and
variants. It must not duplicate raw font sizes, line heights, or families.

The build must remain deterministic and must fail when the emitted JavaScript
references a missing CSS asset. Storybook may consume the source module through
Vite, while npm consumers consume the copied `dist/web` asset.
