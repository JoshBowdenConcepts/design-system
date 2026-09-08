import type { TestRunnerConfig } from "@storybook/test-runner";
import { getStoryContext } from "@storybook/test-runner";
import { checkA11y, injectAxe } from "axe-playwright";

/**
 * FR-011 merge gate. For every story:
 *   (a) accessibility — axe, WCAG 2.2 AA rule sets, fails on any violation.
 *   (b) visual regression — a DOM snapshot of the rendered story compared to a
 *       committed baseline in `apps/docs/__snapshots__/`.
 *
 * DOM (not pixel) snapshots are the deliberate granularity for this scaffold:
 * they are deterministic across machines with no browser/font pinning, which
 * suits a placeholder-only surface. Pixel snapshots can be layered on when the
 * first real components land.
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    if (storyContext.parameters?.a11y?.disable) return;

    await checkA11y(page, "#storybook-root", {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
      },
    });

    const root = await page.$("#storybook-root");
    const innerHTML = (await root?.innerHTML()) ?? "";
    expect(innerHTML).toMatchSnapshot();
  },
};

export default config;
