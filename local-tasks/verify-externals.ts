import path from "path";

(function() {
  const
    Git = require("simple-git/promise"),
    fs = requireModule<FileSystemUtils>("fs"),

    gulp = requireModule<Gulp>("gulp");

  gulp.task("verify-externals", async () => {
    const
      externals = path.resolve(path.join(__dirname, "..", "gulp-tasks", "ext")),
      contents = await fs.readdir(externals);
    for (let dir of contents) {
      switch (dir) {
        case "gulp-nunit-runner":
          await verifyGulpNunitRunnerExternalAt(path.join(externals, dir));
          break;
        default:
          throw new Error(`External ${ dir } is not tested!`);
      }
    }
  });

  async function verifyGulpNunitRunnerExternalAt(at: string) {
    const
      expected = "v2.0.3",
      git = new Git(at),
      branchInfo = await git.branch();
    if (!branchInfo || branchInfo.current !== expected) {
      throw new Error(`Expected tag ${expected} for ext at ${at}`);
    }
  }
})();
