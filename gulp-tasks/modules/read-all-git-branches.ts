(function() {
  const
    safeGit = requireModule<SafeGit>("safe-git"),
    { simpleGit } = require("simple-git");
  module.exports = async function readAllBranches(at?: string): Promise<string[]> {
    return safeGit(async () => {
      const
        git = simpleGit(at ?? "."),
        branches = await git.branch(["-a"]);
      return branches.all;
    }, [])
  }
})();
