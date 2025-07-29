import type { StatusResult } from "simple-git";

(function() {
  const
    gulp = requireModule<Gulp>("gulp");

  gulp.task("verify-gulp-tasks", async () => {
    const
      gitFactory = require("simple-git"),
      path = require("path");

    const rootGit = gitFactory(".");
    const status = (await rootGit.status()) as StatusResult;
    if (status.current !== "master") {
      console.warn("Running in a branch - not verifying gulp-tasks branch to be master");
      return;
    }

    try {
      if (process.env.RUNNING_IN_GITHUB_ACTION) {
        return;
      }
      const
        at = path.resolve(path.join(__dirname, "..", "gulp-tasks")),
        git = gitFactory(at),
        expected = "master",
        branchInfo = await git.branch();
      if (!branchInfo || branchInfo.current !== expected) {
        const err = `Expected gulp-tasks to be checked out as master`;
        console.error(err);
        throw new Error(err);
      }
    } catch (e) {
      console.error(`can't verify gulp-tasks: ${ (e as any).toString() }`);
      throw e;
    }
  });

})();
