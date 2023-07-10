const
  chalk = require("./gulp-tasks/modules/ansi-colors"),
  gitFactory = require("simple-git");

(async function () {
  try {
    const
      gulpTasksGit = gitFactory("gulp-tasks"),
      rootGit = gitFactory(".");

    process.stdout.write(`${chalk.cyanBright("pushing...")}`);
    await Promise.all([
      gulpTasksGit.push(),
      gulpTasksGit.pushTags(),
      rootGit.push(),
      rootGit.pushTags()
    ]);
    console.log(`[ ${chalk.yellow("OK")} ]`);

    process.exit(0);
  } catch (e) {
    console.error(`[${chalk.redBright("FAIL")}]`);
    console.error(e.stack || e);
    process.exit(2);
  }
})();

