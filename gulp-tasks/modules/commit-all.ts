(function() {
  async function commitAll(
    where: string,
    comment: string,
    dryRun?: boolean
) {
    const
      log = requireModule<Log>("log"),
      gitFactory = require("simple-git");
    if (dryRun) {
      log.info(`would add & commit all from: ${where}`);
    }
    else {
      const git = gitFactory(where || ".");
      await git.add(":/");
      await git.commit(comment);
    }
  }
})();
