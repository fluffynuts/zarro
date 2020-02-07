const
  which = require("which"),
  path = require("path"),
  spawn = require("../../gulp-tasks/modules/spawn");

function alwaysAccept() {
  return true;
}

async function invokeGulp(args) {
  const gulp = await which("gulp");
  return spawn(
    gulp,
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
