# Data Model: Text Component

## Text props contract

A generic public React props contract parameterized by the selected intrinsic
element `T`.

| Field | Type | Required | Rules |
|---|---|---:|---|
| `as` | `TextElement` | No | Selects the rendered element; defaults to `p`. |
| `variant` | `TextVariant` | No | Applies a named type-token style after the element default. |
| `className` | `string` | No | Merged with generated CSS Module classes. |
| `children` | `ReactNode` | No | Rendered unchanged as the selected element's children. |
| native props | `ComponentPropsWithoutRef<T>` | No | All props valid for selected `T`, excluding component-owned names. |
| `ref` | `ComponentRef<T>` | No | Ref targets the selected intrinsic element. |

## Enumerations

`TextElement` is `p | span | div | h1 | h2 | h3 | h4 | label | a | strong`.

`TextVariant` is `display | h1 | h2 | h3 | h4 | p | p-sm | label | caption |
overline`.

## Style resolution

1. Resolve `T` from `as`, or `p` when omitted.
2. Apply the CSS Module class mapped to `T` and its default token.
3. If present, apply the CSS Module class mapped to `variant` after the default.
4. Append consumer `className`.
5. Forward all remaining native props and the ref to the resolved element.

The component-owned `as` and `variant` fields are never forwarded to the DOM.

## Validation rules

- Unsupported element and variant literals fail TypeScript compilation.
- Native props are checked against the selected element's React intrinsic props.
- Invalid cross-element props fail typechecking where React's intrinsic types
  reject them.
- No runtime state transitions or persistence exist for this component.
