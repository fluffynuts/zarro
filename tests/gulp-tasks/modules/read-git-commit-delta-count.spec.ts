import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";

describe(`read-git-commit-delta-count`, () => {
  if (process.env.RUNNING_IN_GITHUB_ACTION) {
    return it.skip(`- tests don't work well @ GH`, () => {
    });
  }
  const
    exec = requireModule<Exec>("exec");
  let sut: ReadGitCommitDeltaCount;
  it(`should be importable as a zarro module`, async () => {
    // Arrange
    // Act
    expect(() => requireModule<ReadGitCommitDeltaCount>("read-git-commit-delta-count"))
      .not.toThrow();
    // Assert
  });

  beforeEach(() => {
    jest.setTimeout(10000);
    spyOn(console, "debug");
    spyOn(console, "log");
    spyOn(console, "info");
    spyOn(console, "warn");
    spyOn(console, "error");
    try {
      sut = sut || requireModule<ReadGitCommitDeltaCount>("read-git-commit-delta-count");
    } catch (e) {
      // suppress: otherwise test looks like it passed in WebStorm
    }
  });

  function expectQuiet() {
    // read module should not be outputting to std(out|err);
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  }
  it(`should return 0-0 for same branch`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      { commit, init } = makeCommandsFor(sandbox);
    await init();
    await sandbox.writeFile("README.md", "test");
    await commit(":tada: initial commit");
    // Act
    const result = await sandbox.run(
      () => sut("master", "master")
    );
    // Assert
    expect(result)
      .toEqual({ behind: 0, ahead: 0});
    expectQuiet();
  });

  it(`should return 0-0 for a new branch`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      { commit, branch, init } = makeCommandsFor(sandbox);
    await init();
    await sandbox.writeFile("README.md", "test");
    await commit("initial commit");
    await branch("feature/rad");
    // Act
    const result = await sandbox.run(
      () => sut("master", "feature/rad")
    );
    // Assert
    expect(result)
      .toEqual({ behind: 0, ahead: 0 });
    expectQuiet();
  });

  it(`should return 0-1 for a branch off of master with one extra commit`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      { git, commit } = makeCommandsFor(sandbox);
    await git("init");
    await sandbox.writeFile("README.md", "test");
    await commit(":tada: initial commit");
    await git("checkout", "-b", "some-branch");
    await sandbox.writeFile("README.md", "test\nnew stuff");
    await commit(":memo: add moar dox");
    // Act
    const result = await sandbox.run(
      () => sut("master", "some-branch")
    );
    // Assert
    expect(result)
      .toEqual({ behind: 0, ahead: 1});
    expectQuiet();
  });

  it(`should return 1-1 for a branch off master where both have one extra commit`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      branchName = "feature/some-branch",
      { git, commit } = makeCommandsFor(sandbox);
    await git("init");
    await sandbox.writeFile("README.md", "test");
    await commit(":tada: initial commit");
    await git("checkout", "-b", branchName);
    await sandbox.writeFile("README.md", "test\nnew stuff");
    await commit(":memo: add moar dox");
    await git("checkout", "master");
    await sandbox.writeFile("init.bat", "echo init");
    await commit(":construction: start init file");
    // Act
    const result = await sandbox.run(
      () => sut("master", branchName)
    );
    // Assert
    expect(result)
      .toEqual({ behind: 1, ahead: 1 });
    expectQuiet();
  });

  function makeCommandsFor(sandbox: Sandbox) {
    return {
      git: (...args: string[]) => sandbox.run(() => execGit(...args)),
      commit: (message: string) => sandbox.run(async () => {
        await execGit("add", "-A", ":/");
        await execGit("commit", "-m", `"${message}"`);
      }),
      init: () => sandbox.run(() => execGit("init")),
      branch: (name: string) => sandbox.run(() => execGit("checkout", "-b", `${name}`))
    }

  }

  async function execGit(...args: string[]): Promise<string> {
    return exec("git", args, { suppressOutput: true });
  }
});
