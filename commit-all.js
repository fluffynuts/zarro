const
  Git = require("simple-git/promise"),
  { ask } = require("./gulp-tasks/modules/ask"),
  yargs = require("yargs");

async function addAllAndCommit(git, message) {
  await git.add([ "-A", ":/" ]);
  await git.commit(message);
}

(async function () {
  let message = yargs.argv._.join(" ").trim();
  if (!message) {
    message = await ask("commit message: ");
  }
  if (!message) {
    console.error("No commit message specified!");
    process.exit(1);
  }
  try {
    const
      gulpTasksGit = new Git("gulp-tasks"),
      rootGit = new Git(".");

    await addAllAndCommit(gulpTasksGit, message);
    await addAllAndCommit(rootGit, message);
    process.exit(0);
  } catch (e) {
    console.error(e.stack || e);
    process.exit(2);
  }
})();

