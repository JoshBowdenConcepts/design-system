import { createRef } from "react";
import { Text } from "../src/Text.js";

const anchorRef = createRef<HTMLAnchorElement>();

<Text>Default paragraph</Text>;
<Text as="p">Paragraph</Text>;
<Text as="h1">Heading</Text>;
<Text as="label" htmlFor="email">Email</Text>;
<Text as="strong" variant="label">Strong label</Text>;

// @ts-expect-error Text is text-only; links are intentionally separate components
<Text as="a" href="/docs" ref={anchorRef}>Docs</Text>;

// @ts-expect-error unsupported variant values should fail typechecking
<Text variant="hero" />;

// @ts-expect-error href is not valid for a paragraph element
<Text as="p" href="/docs" />;

// @ts-expect-error invalid props for the selected element must fail
<Text as="label" href="/docs" />;
