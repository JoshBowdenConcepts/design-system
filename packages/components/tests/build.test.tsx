import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Placeholder } from "../src/Placeholder.js";
import { renderSwift } from "../src/generate.js";

describe("Placeholder component", () => {
  it("renders and consumes the --ds-placeholder token, not a hardcoded value", () => {
    const html = renderToStaticMarkup(createElement(Placeholder));
    expect(html).toContain("var(--ds-placeholder)");
    expect(html).toContain("<svg"); // pulls in @design-system/icons
  });

  it("source contains no hardcoded design literals (hex colours, px sizes)", () => {
    const src = readFileSync(join(__dirname, "../src/Placeholder.tsx"), "utf8");
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(src).not.toMatch(/\b\d+px\b/);
  });
});

describe("Swift stub", () => {
  it("empty component list still yields a valid namespace enum", () => {
    const swift = renderSwift([]);
    expect(swift).toContain("public enum DesignSystemComponents {");
    expect(swift.trim().endsWith("}")).toBe(true);
  });
});
