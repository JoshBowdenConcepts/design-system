import type { TokenGroup } from "../types";
import { color } from "./color";
import { semanticColor } from "./color.semantic";

/** All token groups, in the order they should appear in generated output/docs. */
export const groups: TokenGroup[] = [color, semanticColor];

export { color, semanticColor };
