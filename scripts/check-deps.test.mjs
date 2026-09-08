import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkDeps } from "./check-deps.mjs";

let root;

function pkg(dir, manifest) {
  mkdirSync(join(root, dir), { recursive: true });
  writeFileSync(join(root, dir, "package.json"), JSON.stringify(manifest, null, 2));
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "check-deps-"));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("checkDeps", () => {
  it("passes a well-formed workspace", () => {
    pkg("tokens", { name: "@design-system/tokens" });
    pkg("icons", { name: "@design-system/icons", dependencies: { "@design-system/tokens": "workspace:*" } });
    pkg("components", {
      name: "@design-system/components",
      dependencies: { "@design-system/tokens": "workspace:*", "@design-system/icons": "workspace:*" },
    });
    const res = checkDeps(root);
    expect(res).toMatchObject({ ok: true, errors: [], count: 3 });
  });

  it("fails a wrong-direction dependency and names the package", () => {
    pkg("tokens", { name: "@design-system/tokens", dependencies: { "@design-system/icons": "workspace:*" } });
    pkg("icons", { name: "@design-system/icons" });
    pkg("components", { name: "@design-system/components" });
    const res = checkDeps(root);
    expect(res.ok).toBe(false);
    expect(res.errors.join("\n")).toMatch(/packages\/tokens depends on @design-system\/icons/);
  });

  it("fails icons -> components", () => {
    pkg("tokens", { name: "@design-system/tokens" });
    pkg("icons", { name: "@design-system/icons", dependencies: { "@design-system/components": "workspace:*" } });
    pkg("components", { name: "@design-system/components" });
    const res = checkDeps(root);
    expect(res.ok).toBe(false);
    expect(res.errors.join("\n")).toMatch(/packages\/icons depends on @design-system\/components/);
  });

  it("fails an unexpected fourth package", () => {
    pkg("tokens", { name: "@design-system/tokens" });
    pkg("icons", { name: "@design-system/icons" });
    pkg("components", { name: "@design-system/components" });
    pkg("motion", { name: "@design-system/motion" });
    const res = checkDeps(root);
    expect(res.ok).toBe(false);
    expect(res.errors.join("\n")).toMatch(/Unexpected package "packages\/motion"/);
  });

  it("fails a mismatched manifest name", () => {
    pkg("tokens", { name: "@wrong/tokens" });
    pkg("icons", { name: "@design-system/icons" });
    pkg("components", { name: "@design-system/components" });
    const res = checkDeps(root);
    expect(res.ok).toBe(false);
    expect(res.errors.join("\n")).toMatch(/expected "@design-system\/tokens"/);
  });

  it("fails when a layer is missing", () => {
    pkg("tokens", { name: "@design-system/tokens" });
    pkg("icons", { name: "@design-system/icons" });
    const res = checkDeps(root);
    expect(res.ok).toBe(false);
    expect(res.errors.join("\n")).toMatch(/Missing expected package\(s\): packages\/components/);
  });
});
