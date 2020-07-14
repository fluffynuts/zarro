import { Sandbox } from "filesystem-sandbox";

describe(`read-all-git-remotes`, () => {
  let sut: ReadAllGitRemotes;

  const
    exec_ = requireModule<Exec>("exec"),
    git = (...args: string[]) => exec_("git", args, { suppressOutput: true });

  beforeEach(() => {
    try {
      importModule();
    } catch (e) {
    }
  });

  function importModule() {
    sut = requireModule<ReadAllGitRemotes>("read-all-git-remotes");
  }

  it(`should be importable as a zarro module`, async () => {
    // Arrange
    // Act
    expect(() => importModule())
      .not.toThrow();
    // Assert
  });

  it(`should read all remotes, uniqely`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create(),
      originUrl = "https://github.com/user/repo",
      upstreamUrl = "https://bitbucket.com/other-user/other-repo";
    await sandbox.writeFile("README.md", "test");
    await sandbox.run(async () => {
      await git("init");
      await git("add", "-A", ":/");
      await git("commit", "-m", `"initial commit"`);
      await git("remote", "add", "origin", originUrl);
      await git("remote", "add", "upstream", upstreamUrl);
    });
    // Act
    const result = await sandbox.run(sut);
    // Assert
    expect(result)
      .toHaveLength(2);
    expect(result[0].name)
      .toEqual("origin");
    expect(result[0].url)
      .toEqual(originUrl);
    expect(result[1].name)
      .toEqual("upstream");
    expect(result[1].url)
      .toEqual(upstreamUrl);
  });
});
