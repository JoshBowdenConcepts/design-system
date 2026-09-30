import { createRef } from "react";
import { Button } from "../src/Button.js";

const buttonRef = createRef<HTMLButtonElement>();

<Button>Save</Button>;
<Button variant="outline" size="sm">
  Cancel
</Button>;
<Button variant="text" ref={buttonRef}>
  Learn more
</Button>;
<Button fullWidth contentAlignment="space-between" leadingIcon={<svg />}>
  Continue
</Button>;
<Button aria-label="Add item" leadingIcon={<svg />} />;
<Button aria-labelledby="add-item-label" leadingIcon={<svg />} />;

// @ts-expect-error an icon-only Button (no children) requires an accessible name
<Button leadingIcon={<svg />} />;

// @ts-expect-error aria-label and aria-labelledby are mutually exclusive for icon-only content
<Button aria-label="Add" aria-labelledby="add-item-label" />;

// @ts-expect-error unsupported variant values must fail typechecking
<Button variant="ghost">Save</Button>;

// @ts-expect-error unsupported size values must fail typechecking
<Button size="lg">Save</Button>;

// @ts-expect-error unsupported content alignment values must fail typechecking
<Button fullWidth contentAlignment="justify">
  Save
</Button>;

// @ts-expect-error href is not a valid Button prop
<Button href="/docs">Docs</Button>;
