const
  chalk = require("chalk"),
  Git = require("simple-git/promise");

(async function () {
  try {
    const
      gulpTasksGit = new Git("gulp-tasks"),
      rootGit = new Git(".");

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

