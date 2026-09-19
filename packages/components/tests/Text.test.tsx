import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Text } from "../src/Text.js";
import styles from "../src/Text.module.css";

describe("Text", () => {
  it("renders the default paragraph element and preserves children", () => {
    const html = renderToStaticMarkup(<Text>Hello world</Text>);

    expect(html).toContain("<p");
    expect(html).toContain(">Hello world</p>");
    expect(html).not.toContain("as=");
    expect(html).not.toContain("variant=");
  });

  it("renders the selected intrinsic element and omits component-only props from the DOM", () => {
    const html = renderToStaticMarkup(
      <Text as="label" htmlFor="email" variant="label">
        Email
      </Text>,
    );

    expect(html).toContain("<label");
    expect(html).toContain('for="email"');
    expect(html).toContain(">Email</label>");
    expect(html).not.toContain("as=");
    expect(html).not.toContain("variant=");
    expect(html).toContain(styles["default-label"]);
    expect(html).toContain(styles["variant-label"]);
  });

  it("merges consumer className with generated element and variant classes", () => {
    const html = renderToStaticMarkup(
      <Text as="h2" variant="h3" className="custom-tailwind-class">
        Section title
      </Text>,
    );

    expect(html).toContain(styles["default-h2"]);
    expect(html).toContain(styles["variant-h3"]);
    expect(html).toContain("custom-tailwind-class");
  });
});
