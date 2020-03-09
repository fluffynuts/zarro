const
  which = require("which"),
  path = require("path"),
  spawn = require("../../gulp-tasks/modules/spawn");

function alwaysAccept() {
  return true;
}

async function invokeGulp(args) {
  const
    gulp = await which("gulp"),
    gulpTasksFolder = path.join(__dirname, "gulp-tasks"),
    gulpFile = path.join(gulpTasksFolder, "start", "gulpfile.js"),
    env = Object.assign({}, process.env, { GULP_TASKS_FOLDER: gulpTasksFolder });
  return spawn(
    gulp,
    [
      "--gulpfile",
      gulpFile
    ].concat(args),
    { env }
  );
}

module.exports = {
  test: alwaysAccept,
  handler: invokeGulp
};
