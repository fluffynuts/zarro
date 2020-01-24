const
    path = require("path"),
    spawn = require("../tasks/modules/spawn");

function alwaysAccept() {
  return true;
}

function invokeGulp(args) {
  return spawn(
    "gulp",
    [
      "--gulpfile",
      path.join(__dirname, "gulpfile.js")
    ].concat(args)
  );
}

module.exports = {
  test: alwaysAccept,
  handler: invokeGulp
};
