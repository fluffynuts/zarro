import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";

const resolveGitBranch = requireModule<ResolveGitBranch>("resolve-git-branch");
import { system } from "system-wrapper";

describe(`resolve-git-branch`, () => {
  it(`should export a function`, async () => {
    // Arrange
    // Act
    expect(resolveGitBranch)
      .toBeFunction();
    // Assert
  });

  describe(`when GIT_BRANCH is not set`, () => {
    // resolveGitBranch prefers the GIT_BRANCH variable (set by some CI systems)
    const originalGitBranch = process.env.GIT_BRANCH;

    beforeEach(() => {
      delete process.env.GIT_BRANCH;
    });

    afterEach(() => {
      if (originalGitBranch === undefined) {
        delete process.env.GIT_BRANCH;
      } else {
        process.env.GIT_BRANCH = originalGitBranch;
      }
    });

    async function git(cwd: string, ...args: string[]) {
      // explicit identity: CI runners have no global git config
      const result = await system(
        "git",
        [ "-c", "user.name=zarro-tests", "-c", "user.email=zarro-tests@example.com", ...args ],
        { cwd, suppressOutput: true }
      );
      return result.stdout.join("\n").trim();
    }

    async function createRepoWithOneCommitOnBranch(branch: string) {
      // hermetic: the checkout the tests run in is attached on a push but
      // detached on a pull_request, so it can't be used as the source of truth
      const sandbox = await Sandbox.create();
      await git(sandbox.path, "init");
      await git(sandbox.path, "checkout", "-b", branch);
      await git(sandbox.path, "commit", "--allow-empty", "-m", "initial");
      return sandbox;
    }

    it(`should return the branch when there is one`, async () => {
      // Arrange
      const sandbox = await createRepoWithOneCommitOnBranch("some-known-branch");
      // Act
      const result = await resolveGitBranch(sandbox.path);
      // Assert
      expect(result)
        .toEqual("some-known-branch");
    });

    it(`should return the abbreviated commit sha when HEAD is detached`, async () => {
      // Arrange
      const sandbox = await createRepoWithOneCommitOnBranch("some-known-branch");
      await git(sandbox.path, "checkout", "--detach");
      const fullSha = await git(sandbox.path, "rev-parse", "HEAD");
      // Act
      const result = await resolveGitBranch(sandbox.path);
      // Assert
      expect(result)
        .toBeString();
      expect(result!.length)
        .toBeGreaterThanOrEqual(7);
      expect(fullSha.startsWith(result!))
        .toBeTrue();
    });
  });

  it(`should return undefined when there is no remote`, async () => {
    // Arrange
    const sandbox = await Sandbox.create();
    // Act
    const result = await resolveGitBranch(sandbox.path);
    // Assert
    expect(result)
      .toBeUndefined();
  });

  afterAll(async () => {
    await Sandbox.destroyAll();
  });
});
