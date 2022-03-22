import path from "path";

(function() {
  const
    gitFactory = require("simple-git"),
    gulp = requireModule<Gulp>("gulp");

  gulp.task("verify-gulp-tasks", async () => {
    if (process.env.RUNNING_IN_GITHUB_ACTION) {
      return;
    }
    const
      at = path.resolve(path.join(__dirname, "..", "gulp-tasks")),
      git = gitFactory(at),
      expected = "master",
      branchInfo = await git.branch();
    if (!branchInfo || branchInfo.current !== expected) {
      throw new Error(`Expected gulp-tasks to be checked out as master`);
    }
  });

})();
