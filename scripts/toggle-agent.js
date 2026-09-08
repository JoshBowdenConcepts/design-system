#!/usr/bin/env node
const { readFileSync } = require("fs");
const { join } = require("path");
const { execFileSync } = require("child_process");

const configPath = join(__dirname, "..", ".specify", "integration.json");
const { default_integration } = JSON.parse(readFileSync(configPath, "utf8"));

const next = default_integration === "claude" ? "cursor-agent" : "claude";

console.log(`Switching default integration: ${default_integration} -> ${next}`);
execFileSync("specify", ["integration", "use", next], { stdio: "inherit" });
