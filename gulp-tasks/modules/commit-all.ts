(function() {
  async function commitAll(
    where: string,
    comment: string,
    dryRun?: boolean
) {
    const
      log = requireModule<Log>("log"),
      { simpleGit } = require("simple-git");
    if (dryRun) {
      log.info(`would add & commit all from: ${where}`);
    }
    else {
      const git = simpleGit(where || ".");
      await git.add(":/");
      await git.commit(comment);
    }
  }
})();
