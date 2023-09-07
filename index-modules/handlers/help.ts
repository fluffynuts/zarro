(function () {
  const contains = require("../contains-any");

  module.exports = {
    test: (args: string[]) => contains(args, "-h", "--help"),
    handler: () => {
      [
        "zarro",
        "usage: zarro <zarro args or gulp parameters>",
        "  where zarro args are of:",
        "  --create-task   guide you through scaffolding a new local task",
        "  --help|-h       show this help",
        "  --init          add a zarro npm script to your package.json",
        "  --show-env      show all environment variables observed by tasks",
        "  --tasks         show all tasks registered to gulp",
      ].forEach(s => console.log(s));
      return Promise.resolve();
    }
  };
})();
