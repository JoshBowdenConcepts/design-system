import { describe, it, expect } from "vitest";
import {
  componentNameFor,
  parseSvg,
  renderIndexJs,
  renderIndexDts,
  renderSwift,
  loadIcons,
} from "../src/generate.js";

describe("componentNameFor", () => {
  it("pascal-cases and suffixes Icon", () => {
    expect(componentNameFor("placeholder.svg")).toBe("PlaceholderIcon");
    expect(componentNameFor("arrow-left.svg")).toBe("ArrowLeftIcon");
  });
});

describe("parseSvg", () => {
  it("extracts viewBox and path data", () => {
    const icon = parseSvg("placeholder.svg", '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>');
    expect(icon).toMatchObject({ componentName: "PlaceholderIcon", viewBox: "0 0 24 24", paths: ["M4 4h16v16H4z"] });
  });
});

describe("source SVGs", () => {
  const icons = loadIcons();

  it("includes the placeholder icon", () => {
    expect(icons.map((i) => i.componentName)).toContain("PlaceholderIcon");
  });

  it("emits a typed React component, no hardcoded colour", () => {
    const js = renderIndexJs(icons);
    expect(js).toContain("export function PlaceholderIcon");
    expect(js).not.toMatch(/#[0-9a-fA-F]{3,8}\b/); // no hex colours
    const dts = renderIndexDts(icons);
    expect(dts).toContain("export declare const PlaceholderIcon: FC<SVGProps<SVGSVGElement>>;");
  });

  it("is deterministic", () => {
    expect(renderIndexJs(icons)).toBe(renderIndexJs(icons));
  });
});

describe("empty-but-well-formed", () => {
  it("no icons -> valid empty barrel", () => {
    expect(renderIndexJs([])).toContain("export {};");
    expect(renderIndexDts([])).toContain("export {};");
  });

  it("no icons -> valid Swift namespace stub", () => {
    const swift = renderSwift([]);
    expect(swift).toContain("public enum DesignSystemIcons {");
    expect(swift.trim().endsWith("}")).toBe(true);
  });
});
