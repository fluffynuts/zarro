const
  chalk = require("ansi-colors"),
  invokeGulp = require("./invoke-gulp").handler,
  contains = require("../contains-any");

module.exports = {
  test: args => contains(args, "--show-environment", "--show-env"),
  handler: () => {
    console.log(chalk.whiteBright("-- Zarro Environment Variables --"));
    console.log(chalk.gray(
      [
        "These variables guide zarro operations",
        "Each variable applies to certain tasks and some may be overridden by others"
      ].join("\n")
      )
    )
    // next, spawn gulp with the help:environment task
    // -> we do this to ensure that any built-in or local task which
    //    has registered usage of variables has its registration
    //    reflected in the help
    let muted = true;
    if (process.stdout.isTTY) {
      process.env.FORCE_COLOR = 1;
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
        }
      })
  }
};
