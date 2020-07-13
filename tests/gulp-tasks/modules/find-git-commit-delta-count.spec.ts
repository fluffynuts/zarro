import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { runInFolder } from "../../test-helpers/run-in-folder";

describe(`find-git-commit-delta-count`, () => {
  const
    exec = requireModule<Exec>("exec"),
    sut = requireModule<ReadGitCommitDeltaCount>("fetch-git-commit-delta-count");

  it(`should return 0-0 for same branch`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create()
    await initGit(sandbox.path);
    await sandbox.writeFile("README.md", "test");
    await commitAll(sandbox.path, ":tada: initial commit");
    // Act
    const result = await runInFolder(
      sandbox.path, () => sut("master", "master")
    );
    // Assert
    expect(result)
      .toEqual({ behind: 0, ahead: 0});
  });

  it(`should return 0-1 for a branch off of master with one extra commit`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create()
    await initGit(sandbox.path);
    await sandbox.writeFile("README.md", "test");
    await commitAll(sandbox.path, ":tada: initial commit");
    await git("checkout", "-b", "some-branch");
    await sandbox.writeFile("README.md", "test\nnew stuff");
    await commitAll(sandbox.path, ":memo: add moar dox");
    // Act
    const result = await runInFolder(
      sandbox.path, () => sut("master", "master")
    );
    // Assert
    expect(result)
      .toEqual({ behind: 0, ahead: 1});
  });

  async function commitAll(at: string, message: string) {
    await runInFolder(at, async() => {
      await git("add", "-A", ":/");
      await git("commit", "-m", `"${message}"`);
    });
  }

  async function initGit(at: string) {
    await runInFolder(at, () =>
      git("init")
    );
  }

  async function git(...args: string[]): Promise<string> {
    return exec("git", args);
  }
});
