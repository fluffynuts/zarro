import path from "path";

(function() {
  const
    Git = require("simple-git/promise"),
    gulp = requireModule<Gulp>("gulp");

  gulp.task("verify-gulp-tasks", async () => {
    if (process.env.SKIP_SUBMODULE_CHECKS) {
      return;
    }
    const
      at = path.resolve(path.join(__dirname, "..", "gulp-tasks")),
      git = new Git(at),
      expected = "master",
      branchInfo = await git.branch();
    if (!branchInfo || branchInfo.current !== expected) {
      throw new Error(`Expected gulp-tasks to be checked out as master`);
    }
  });

})();
