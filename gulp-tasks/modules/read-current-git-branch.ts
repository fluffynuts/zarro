(function() {
  const
    safeGit = requireModule<SafeGit>("safe-git"),
    { simpleGit } = require("simple-git");

  module.exports = async function readCurrentBranch(at?: string): Promise<string | undefined> {
    return safeGit(async () => {
      const
        git = simpleGit(at ?? "."),
        branchInfo = await git.branch();
      return branchInfo.current === ""
        ? undefined
        : branchInfo.current; // also returns sha if detached!
    });
  }
})();
