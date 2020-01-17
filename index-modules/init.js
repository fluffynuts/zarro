const
  fs = require("fs"),
  readTextFile = require("./read-text-file");

function trySetupZarroScript(overridePackageFileName) {
  const pkg = overridePackageFileName || "package.json";
  if (!fs.existsSync(pkg)) {
    return;
  }
  const
    stringContents = readTextFile(pkg),
    tabSize = guessTabSizeFor(stringContents),
    packageJson = JSON.parse(stringContents);
  let scripts = packageJson.scripts;
  if (!scripts) {
    packageJson.scripts = scripts = {};
  }
  if (scripts["zarro"]) {
    console.log("zarro npm script already installed; use with 'npm run zarro'");
  }
  if (!scripts["zarro"]) {
    scripts["zarro"] = "zarro";
  }
  fs.writeFileSync(pkg, JSON.stringify(packageJson, null, tabSize));
  console.log("run zarro with 'npm run zarro -- {tasks or gulp arguments}')");
  console.log("eg: 'npm run zarro -- build' to attempt .net project build");
  console.log("get more help with 'npm run zarro -- --help'");
  return Promise.resolve();
}

function guessTabSizeFor(json) {
  const lines = (json || "").split("\n");
  if (lines.length < 2) {
    return 2;
  }
  const leadingSpaces = lines[1].match(/^ +"/g);
  if (leadingSpaces) {
    const calculated = leadingSpaces.length - 1; // drop the quote
    return calculated > 0
      ? calculated
      : 2;
  }
  return 2; // give up
}


function isInit(args) {
  return args.length === 1 &&
    args[0] === "--init";
}

module.exports = {
  test: isInit,
  handler: trySetupZarroScript
};
