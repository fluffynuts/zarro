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
      [ code, comment ] = splitComment(line);
    if (isEmpty(code)) {
      // comment-only line or empty line
      continue;
    }
    if (looksInvalid(code)) {
      console.warn(`invalid config line in ${defaultsFile}:\n${line}`);
      continue;
    }
    const
      parts = code.trim().split("="),
      name = parts[0],
      value = Array.from(skip(parts, 1)).join("=");
    debug(`setting env var ${name} to ${value}`);
    process.env[name] = value;
  }
}

function looksInvalid(code) {
  return (code || "").indexOf("=") === -1;
}

function isEmpty(text) {
  return (text || "").trim() === "";
}

function splitComment(line) {
  if (!line) {
    return [ "", "" ];
  }
  const idx = line.indexOf("#");
  if (idx === -1) {
    return [ line, "" ];
  }
  return [ line.substring(0, idx), line.substring(idx + 1) ];
}

(async function () {
  try {
    await loadDefaults();
    const args = await gatherArgs([ path.join(path.dirname(__dirname), ".bin", "zarro"), __filename ]);
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


