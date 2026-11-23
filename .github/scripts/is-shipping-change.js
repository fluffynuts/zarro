#!/usr/bin/env node
// Decides whether a change touches anything which ships in the npm package, so that
// the release workflow can skip publishing (beta or stable) for changes which don't.
//
//   git diff --name-only <from> <to> | node is-shipping-change.js     (prints true or false)
//
// Not shipping: tests, .github (workflows and scripts), markdown, lockfiles, .gitignore.
// Everything else is treated as shipping (including package.json: dependency and script
// changes are released), so a new top-level file or folder errs on the side of a release.
//
// note: README.md is part of the npm package page, but is deliberately treated as docs.
const notShippingBasenames = new Set([ "package-lock.json", ".gitignore" ]);

function doesNotShip(file) {
  const basename = file.split("/").pop();
  return file.startsWith("tests/") ||
    file.startsWith(".github/") ||
    basename.endsWith(".md") ||
    notShippingBasenames.has(basename);
}

function isShippingChange(files) {
  return files
    .map(f => f.trim())
    .filter(f => f !== "")
    .some(f => !doesNotShip(f));
}

module.exports = { isShippingChange };

if (require.main === module) {
  const input = require("fs").readFileSync(0, "utf8");
  process.stdout.write(`${ isShippingChange(input.split("\n")) }\n`);
}
