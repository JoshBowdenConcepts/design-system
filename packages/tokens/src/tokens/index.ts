import type { TokenGroup } from "../types";
import { palette } from "./palette";
import { semanticColor } from "./color.semantic";
import { space } from "./space";

/**
 * All token groups, in the order they should appear in generated output/docs.
 * `palette` is internal (referenced by semantic tokens) and is skipped by the
 * generator's public output.
 */
export const groups: TokenGroup[] = [palette, semanticColor, space];

export { palette, semanticColor, space };
