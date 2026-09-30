import { describe, it, expect } from "vitest";
import {
  componentNameFor,
  parseSvg,
  parsePathToOps,
  parseViewBoxSize,
  renderIndexJs,
  renderIndexDts,
  renderSwift,
  renderSwiftShape,
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

describe("parsePathToOps", () => {
  it("parses move/horizontal/vertical/close (the placeholder icon's path)", () => {
    expect(parsePathToOps("M4 4h16v16H4z")).toEqual([
      { op: "move", x: 4, y: 4 },
      { op: "line", x: 20, y: 4 },
      { op: "line", x: 20, y: 20 },
      { op: "line", x: 4, y: 20 },
      { op: "close" },
    ]);
  });

  it("treats extra coordinate pairs after M as implicit linetos", () => {
    expect(parsePathToOps("M0 0 10 0 10 10")).toEqual([
      { op: "move", x: 0, y: 0 },
      { op: "line", x: 10, y: 0 },
      { op: "line", x: 10, y: 10 },
    ]);
  });

  it("resolves relative commands against the current point", () => {
    expect(parsePathToOps("m4 4l2 3")).toEqual([
      { op: "move", x: 4, y: 4 },
      { op: "line", x: 6, y: 7 },
    ]);
  });

  it("parses absolute cubic curves", () => {
    expect(parsePathToOps("M0 0C1 2 3 4 5 6")).toEqual([
      { op: "move", x: 0, y: 0 },
      { op: "curve", x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
    ]);
  });

  it("rejects unsupported commands (arcs, quadratic/shorthand curves) by name", () => {
    expect(() => parsePathToOps("M0 0A5 5 0 0 1 10 10")).toThrow(/'A'/);
    expect(() => parsePathToOps("M0 0Q5 5 10 10")).toThrow(/'Q'/);
  });
});

describe("parseViewBoxSize", () => {
  it("extracts width/height from a viewBox", () => {
    expect(parseViewBoxSize("0 0 24 24")).toEqual({ width: 24, height: 24 });
  });

  it("throws naming a malformed viewBox", () => {
    expect(() => parseViewBoxSize("not a viewbox")).toThrow(/Malformed viewBox/);
  });
});

describe("renderSwiftShape", () => {
  const icon = parseSvg("placeholder.svg", '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>');

  it("emits a public Shape (not a View with an explicit fill), so it inherits currentColor", () => {
    const swift = renderSwiftShape(icon);
    expect(swift).toContain("public struct PlaceholderIcon: Shape {");
    expect(swift).not.toContain(".fill(");
    expect(swift).toContain("func path(in rect: CGRect) -> Path");
  });

  it("scales every point from the viewBox to the caller's rect", () => {
    const swift = renderSwiftShape(icon);
    expect(swift).toContain("let sx = rect.width / 24");
    expect(swift).toContain("let sy = rect.height / 24");
    expect(swift).toContain("path.move(to: CGPoint(x: 4 * sx, y: 4 * sy))");
    expect(swift).toContain("path.closeSubpath()");
  });
});

describe("renderSwift — non-empty icon set", () => {
  const icons = loadIcons();
  const swift = renderSwift(icons);

  it("imports SwiftUI and keeps the namespace stub alongside real Shape types", () => {
    expect(swift).toContain("import SwiftUI");
    expect(swift).toContain("public enum DesignSystemIcons {");
    expect(swift).toContain("public struct PlaceholderIcon: Shape {");
  });

  it("is deterministic", () => {
    expect(renderSwift(icons)).toBe(swift);
  });
});
