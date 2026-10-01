import { createRef } from "react";
import { Link } from "../src/Link.js";

const anchorRef = createRef<HTMLAnchorElement>();

<Link href="/docs">Read the docs</Link>;
<Link href="/docs" size="p">Read the docs</Link>;
<Link href="/docs" size="p-sm">Read the docs</Link>;
<Link href="/docs" size="label">Read the docs</Link>;
<Link href="/docs" size="caption">Read the docs</Link>;
<Link href="/docs" standalone ref={anchorRef}>View all projects</Link>;
<Link href="https://example.com" external>
  Status page
</Link>;
<Link>Unavailable destination</Link>;
<Link aria-label="Add item" href="/docs" />;
<Link aria-labelledby="add-item-label" href="/docs" />;

// @ts-expect-error unsupported size values must fail typechecking
<Link href="/docs" size="h1">Read the docs</Link>;

// @ts-expect-error unsupported size values must fail typechecking
<Link href="/docs" size="display">Read the docs</Link>;

// @ts-expect-error consumers cannot override the managed `target` attribute
<Link href="/docs" target="_self">Read the docs</Link>;

// @ts-expect-error consumers cannot override the managed `rel` attribute
<Link href="/docs" rel="nofollow">Read the docs</Link>;

// @ts-expect-error content-less Link (no children) requires an accessible name
<Link href="/docs" />;

// @ts-expect-error aria-label and aria-labelledby are mutually exclusive for content-less Link
<Link aria-label="Add" aria-labelledby="add-item-label" href="/docs" />;
