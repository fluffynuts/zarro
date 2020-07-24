import path from "path";

(function() {
  const
    Git = require("simple-git/promise"),
    fs = requireModule<FileSystemUtils>("fs"),

    gulp = requireModule<Gulp>("gulp");

  gulp.task("verify-externals", async () => {
    if (process.env.RUNNING_IN_GITHUB_ACTION) {
      return;
    }
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
      expected = ["v2.0.3", "f547f79"],
      git = new Git(at);
    await git.fetch(["--tags"]);
    const branchInfo = await git.branch();
    const current = branchInfo ? branchInfo.current : "";
    // FIXME: find a better way to tie up tags to a sha
    if (expected.indexOf(current) === -1) {
      throw new Error(`Expected tag ${expected} for ext at ${at} (found: ${branchInfo.current})`);
    }
  }
})();
