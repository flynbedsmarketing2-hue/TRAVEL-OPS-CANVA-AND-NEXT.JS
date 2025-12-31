#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const modulesToLink = ["react", "react-dom", "picocolors"];
const targetNodeModules = path.join(root, "node_modules");
const appNodeModules = path.join(root, "travel-ops-oups", "node_modules");

if (!fs.existsSync(appNodeModules)) {
  fs.mkdirSync(appNodeModules, { recursive: true });
}

for (const moduleName of modulesToLink) {
  const sourcePath = path.join(targetNodeModules, moduleName);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`Skipping ${moduleName}: not found in root node_modules`);
    continue;
  }

  const linkPath = path.join(appNodeModules, moduleName);
  try {
    if (fs.existsSync(linkPath)) {
      fs.rmSync(linkPath, { recursive: true, force: true });
    }
    fs.symlinkSync(sourcePath, linkPath, "junction");
  } catch (error) {
    console.error(`Cannot create symlink for ${moduleName}:`, error);
    process.exitCode = 1;
  }
}
