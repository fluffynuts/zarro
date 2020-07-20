#!/usr/bin/env node
// TODO: this file should be verified as having unix line-endings
const
  path = require("path"),
  debug = require("debug")("zarro"),
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

(async function () {
  try {
    const args = await gatherArgs([path.join(path.dirname(__dirname), ".bin", "zarro"), __filename]);
    const handler = await findHandlerFor(args);
    if (!handler) {
      throw new Error("no handler for current args");
    }
    if (typeof handler !== "function") {
      throw new Error(`handler for ${JSON.stringify(args)} is not a function?!`);
    }
    await handler(args);
  } catch (e) {
    debug(e.stack || e);
    process.exit(1);
  }
})();


