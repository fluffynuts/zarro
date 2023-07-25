#!/usr/bin/env node
// TODO: this file should be verified as having unix line-endings
const
  { fileExists, readTextFileLines } = require("yafs"),
  path = require("path"),
  debug = require("debug")("zarro"),
  { ZarroError } = require("./gulp-tasks/modules/zarro-error"),
  { skip, take } = require("./gulp-tasks/modules/linq"),
  gatherArgs = require("./index-modules/gather-args");

function requireHandler(name) {
  const result = require(`./index-modules/handlers/${name}`);
  return { ...result, name };
}

const handlers = [
  requireHandler("init"),
  requireHandler("help"),
  requireHandler("show-env"),
  // must always come last as it will always volunteer to handle
  requireHandler("invoke-gulp")
];

async function findHandlerFor(args) {
  for (let handler of handlers) {
    debug({
      label: "investigating handler",
      name: handler.name
    });
    if (await handler.test(args)) {
      debug(`-> handler ${handler.name} is taking control...`);
      return handler.handler;
    }
  }
  return null;
}

async function loadDefaults() {
  const
    defaultsFile = ".zarro-defaults",
    exists = await fileExists(defaultsFile);
  if (!exists) {
    return;
  }
  const
    lines = await readTextFileLines(defaultsFile);
  for (const line of lines) {
    const
      parts = line.trim().split("="),
      name = parts[0],
      value = Array.from(skip(parts, 1)).join("=");
    debug(`setting env var ${name} to ${value}`);
    process.env[name] = value;
  }
}

(async function () {
  try {
    await loadDefaults();
    const args = await gatherArgs([path.join(path.dirname(__dirname), ".bin", "zarro"), __filename]);
    const handler = await findHandlerFor(args);
    if (!handler) {
      throw new ZarroError("no handler for current args");
    }
    if (typeof handler !== "function") {
      throw new ZarroError(`handler for ${JSON.stringify(args)} is not a function?!`);
    }
    await handler(args);
  } catch (e) {
    debug(e.stack || e);
    process.exit(1);
  }
})();


