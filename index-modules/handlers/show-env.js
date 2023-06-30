const
  requireModule = require("../../gulp-tasks/modules/require-module"),
  chalk = requireModule("ansi-colors"),
  invokeGulp = require("./invoke-gulp").handler,
  longSwitch = "--show-environment",
  shortSwitch = "--show-env",
  contains = require("../contains-any");

module.exports = {
  test: args => contains(args, longSwitch, shortSwitch),
  handler: () => {
    console.log(chalk.whiteBright("-- Zarro Environment Variables --"));
    console.log(chalk.gray(
      [
        "These variables guide zarro operations",
        "Each variable applies to certain tasks and some may be overridden by others"
      ].join("\n")
      )
    )
    const filter = [];
    let addFilter = false;
    for (const arg of process.argv) {
      switch (arg) {
        case longSwitch:
        case shortSwitch:
          addFilter = true;
          break;
        default:
          if (addFilter) {
            filter.push(arg);
          }
      }
    }
    process.env["HELP_ENV_FILTER"] = filter.join(" ");
    // next, spawn gulp with the help:environment task
    // -> we do this to ensure that any built-in or local task which
    //    has registered usage of variables has its registration
    //    reflected in the help
    let muted = true;
    if (process.stdout.isTTY && !process.env.NO_COLOR) {
      process.env.FORCE_COLOR = "1";
    }
    return invokeGulp(
      [ "help:environment" ], {
        stdout: data => {
          const lines = data.toString().split("\n");
          lines.forEach(line => {
            line = line || "";
            if (!!line.match(/help:environment/)) {
              muted = false;
              return;
            }
            if (muted) {
              return;
            }
            console.log(line);
          })
        },
        stderr: data => {
          console.error(data.toString());
        },
        interactive: false,
        suppressStdIoInErrors: true
      })
  }
};
