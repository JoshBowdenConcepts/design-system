# Text Component API Contract

## Export

`@design-system/components` exports `Text` and its public `TextElement` and
`TextVariant` types.

## Usage

```tsx
<Text>Body copy</Text>
<Text as="h1">Page title</Text>
<Text as="label" htmlFor="email">Email</Text>
```

## Contract

- `as` is optional and defaults to `p`.
- `as` accepts only the documented intrinsic `TextElement` union.
- `variant` is optional and accepts only `TextVariant`.
- The selected element determines native prop and ref types.
- `variant` visually overrides the default style mapped from `as`.
- `className` is merged with generated module classes.
- `as` and `variant` are not DOM attributes.
- Children and valid native props are forwarded unchanged.

## Type examples

```tsx
const labelRef = useRef<HTMLLabelElement>(null);
<Text as="label" htmlFor="email" ref={labelRef}>Email</Text>;

// @ts-expect-error: href is not a paragraph prop
<Text href="/docs" />;

// @ts-expect-error: links are intentionally separate from Text
<Text as="a" href="/docs" />;

// @ts-expect-error: variant is not part of the public union
<Text variant="hero" />;
```
