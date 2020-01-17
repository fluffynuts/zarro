#!/usr/bin/env node
const
  gatherArgs = require("./index-modules/gather-args");

const handlers = [
  require("./index-modules/init"),
  require("./index-modules/help"),
  require("./index-modules/invoke-gulp"),
];

(async function () {
  const args = gatherArgs(__filename);
  const handler = handlers.reduce((acc, cur) => {
    if (acc) {
      return acc;
    }
    return cur.test(args)
      ? cur.handler
      : acc;
  }, null);
  if (!handler) {
    throw new Error("no handler for current args");
  }
  await handler(args);
})();


