const
  Git = require("simple-git/promise"),
  yargs = require("yargs");

async function addAllAndCommit(git, message) {
  await git.add(["-A", ":/"]);
  await git.commit(message);
}

(async function () {
  const
    message = yargs.argv._.join(" ").trim();
  if (!message) {
    console.error("No commit message specified!");
    process.exit(1);
  }
  try {
    const
      nunitRunnerGit = new Git("gulp-tasks/ext/gulp-nunit-runner"),
      gulpTasksGit = new Git("gulp-tasks"),
      rootGit = new Git(".");

    await addAllAndCommit(gulpTasksGit, message);
    await addAllAndCommit(rootGit, message);
    await addAllAndCommit(nunitRunnerGit, message);
    process.exit(0);
  } catch (e) {
    console.error(e.stack || e);
    process.exit(2);
  }
})();

