import { describe, expect, it } from "vitest";
import {
  renderTypographySwift,
  resolveTypography,
} from "../../src/typography.js";
import type { Tokens } from "../../src/types.js";

describe("iOS typography token propagation", () => {
  it("changes only the descriptor sourced from the edited type token", () => {
    const source: Tokens = {
      display: {
        value:
          "normal normal 800 2.5rem/1.05 'Bricolage Grotesque', sans-serif",
      },
      p: { value: "normal normal 400 1rem/1.625 'Public Sans', sans-serif" },
    };
    const before = renderTypographySwift(
      resolveTypography({
        "type.display": source.display!,
        "type.p": source.p!,
      }),
    );
    const afterSource: Tokens = {
      ...source,
      p: { value: "normal normal 500 1.125rem/1.5 'Public Sans', sans-serif" },
    };
    const after = renderTypographySwift(
      resolveTypography({
        "type.display": afterSource.display!,
        "type.p": afterSource.p!,
      }),
    );

    expect(after).not.toBe(before);
    expect(after).toContain(
      'public static let p = DesignSystemTypography(fontName: "PublicSansRoman-Medium", pointSize: 18, weight: 500, lineHeightMultiplier: 1.5)',
    );
    expect(after.match(/public static let display =[^\n]+/)?.[0]).toBe(
      before.match(/public static let display =[^\n]+/)?.[0],
    );
  });
});
