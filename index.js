#!/usr/bin/env node
const
  gatherArgs = require("./index-modules/gather-args");

const handlers = [
  require("./index-modules/handlers/init"),
  require("./index-modules/handlers/help"),
  require("./index-modules/handlers/invoke-gulp"),
];

async function findHandlerFor(args) {
  for (let handler of handlers) {
    if (await handler.test(args)) {
      return handler.handler;
    }
  }
  return null;
}

(async function () {
  try {
    const args = await gatherArgs(__filename);
    const handler = await findHandlerFor(args);
    if (!handler) {
      throw new Error("no handler for current args");
    }
    if (typeof handler !== "function") {
      throw new Error(`handler for ${JSON.stringify(args)} is not a function?!`);
    }
    await handler(args);
  } catch (e) {
    console.error(e.stack);
    process.exit(1);
  }
})();


