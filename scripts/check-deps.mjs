#!/usr/bin/env node
// Enforces the one-way dependency direction: tokens -> icons -> components.
// - No package under packages/ other than tokens, icons, components.
// - Each manifest name must be @design-system/<dir>.
// - Internal (@design-system/*) deps must respect the allowed matrix.
// Exits non-zero and names the offending package on any violation.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCOPE = "@design-system";

const ALLOWED = {
  tokens: new Set([]),
  icons: new Set(["tokens"]),
  components: new Set(["tokens", "icons"]),
};

/**
 * @param {string} packagesDir absolute path to the workspace `packages/` dir
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function checkDeps(packagesDir) {
  /** @type {string[]} */
  const errors = [];
  const add = (msg) => errors.push(msg);

  let dirs = [];
  try {
    dirs = readdirSync(packagesDir).filter((name) =>
      statSync(join(packagesDir, name)).isDirectory(),
    );
  } catch {
    return { ok: false, errors: [`Cannot read ${packagesDir}.`] };
  }

  for (const dir of dirs) {
    if (!(dir in ALLOWED)) {
      add(
        `Unexpected package "packages/${dir}": only tokens, icons, components are allowed.`,
      );
      continue;
    }

    let manifest;
    try {
      manifest = JSON.parse(
        readFileSync(join(packagesDir, dir, "package.json"), "utf8"),
      );
    } catch {
      add(`packages/${dir} has no readable package.json.`);
      continue;
    }

    const expectedName = `${SCOPE}/${dir}`;
    if (manifest.name !== expectedName) {
      add(
        `packages/${dir} is named "${manifest.name}", expected "${expectedName}".`,
      );
    }

    const deps = {
      ...manifest.dependencies,
      ...manifest.peerDependencies,
      ...manifest.devDependencies,
    };
    for (const depName of Object.keys(deps)) {
      if (!depName.startsWith(`${SCOPE}/`)) continue;
      const depLayer = depName.slice(SCOPE.length + 1);
      if (!ALLOWED[dir].has(depLayer)) {
        add(
          `packages/${dir} depends on ${depName}, which violates the one-way ` +
            `dependency direction (tokens -> icons -> components).`,
        );
      }
    }
  }

  const missing = Object.keys(ALLOWED).filter((d) => !dirs.includes(d));
  if (missing.length) {
    add(
      `Missing expected package(s): ${missing
        .map((d) => `packages/${d}`)
        .join(", ")}.`,
    );
  }

  return { ok: errors.length === 0, errors, count: dirs.length };
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const { ok, errors, count } = checkDeps(join(repoRoot, "packages"));
  if (ok) {
    console.log(`dependency matrix OK (${count} packages)`);
  } else {
    for (const e of errors) console.error(`✗ ${e}`);
    console.error("\ndependency matrix check FAILED");
    process.exit(1);
  }
}
