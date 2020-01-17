// noinspection JSUndefinedPropertyAssignment
const fs = require("fs"),
  path = require("path"),
  gulpTasksFolder = path.join(__dirname, "tasks"),
  requireModule = global.requireModule = function (mod) {
    const modulePath = [".", gulpTasksFolder, "modules", mod].join("/");
    if (fs.existsSync(modulePath + ".js")) {
      return require(modulePath);
    } else {
      return require(mod);
    }
  };


if (!fs.existsSync(gulpTasksFolder)) {
  console.error("Can't find bundled tasks!");
  process.exit(2);
}

function bootstrapGulp() {
  const importNpmTasks = requireModule("import-npm-tasks");
  try {
    importNpmTasks();
    const requireDir = require("require-dir");
    requireDir(gulpTasksFolder);
    // local tasks should be found in the consuming repo
    ["override-tasks", "local-tasks"].forEach(function (dirname) {
      if (fs.existsSync(dirname)) {
        requireDir(dirname);
      }
    });
  } catch (e) {
    if (shouldDump(e)) {
      console.error(e);
    } else {
      if (!process.env.DEBUG) {
        console.log(
          "Error occurred. For more info, set the DEBUG environment variable (eg set DEBUG=*)."
        );
      }
    }
    process.exit(1);
  }
}

function shouldDump(e) {
  return process.env.ALWAYS_DUMP_GULP_ERRORS ||
    process.env.DEBUG ||
    probablyNotReportedByGulp(e);
}

function probablyNotReportedByGulp(e) {
  const message = (e || "").toString().toLowerCase();
  return ["cannot find module", "referenceerror", "syntaxerror"].reduce(
    (acc, cur) => {
      return acc || message.indexOf(cur) > -1;
    },
    false
  );
}

bootstrapGulp();

