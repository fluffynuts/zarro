const
  { cyanBright, yellow, redBright } = require("./gulp-tasks/modules/ansi-colors"),
  gitFactory = require("simple-git");

(async function (){
  try {
    const
      gulpTasksGit = gitFactory("gulp-tasks"),
      rootGit = gitFactory(".");

    process.stdout.write(`${ cyanBright("pushing...") }`);
    await Promise.all([
      gulpTasksGit.push(),
      gulpTasksGit.pushTags(),
    ]);
    await Promise.all([
      rootGit.push(),
      rootGit.pushTags()
    ]);
    console.log(`[ ${ yellow("OK") } ]`);

    process.exit(0);
  } catch (e) {
    console.error(`[${ redBright("FAIL") }]`);
    console.error(e.stack || e);
    process.exit(2);
  }
})();

