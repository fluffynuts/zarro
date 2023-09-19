const
  gitFactory = require("simple-git"),
  { ask } = require("./gulp-tasks/modules/ask"),
  yargs = require("yargs");

async function addAllAndCommit(git, message) {
  await git.add([ "-A", ":/" ]);
  await git.commit(message);
}

(async function () {
  console.warn("Rather use regular ol' git...");
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
      rootGit = gitFactory(".");

    await addAllAndCommit(rootGit, message);
    process.exit(0);
  } catch (e) {
    console.error(e.stack || e);
    process.exit(2);
  }
})();

