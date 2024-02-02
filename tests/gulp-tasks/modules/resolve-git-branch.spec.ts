import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
const resolveGitBranch = requireModule<ResolveGitBranch>("resolve-git-branch");
import { writeTextFile } from "yafs";

describe(`resolve-git-branch`, () => {
  const system = requireModule<System>("system");
  it(`should export a function`, async () => {
    // Arrange
    // Act
    expect(resolveGitBranch)
      .toBeFunction();
    // Assert
  });

  it(`should return the branch`, async () => {
    // Arrange
    const sandbox = await Sandbox.create();

    await sandbox.run(async () => {
      await system("git init");
      await writeTextFile("foo", "bar");
      await system("git add -A :/");
      await system("git commit -m \"test\"");
    });
    // Act
    const zarroBranch = await sandbox.run(() => resolveGitBranch());
    // Assert
    expect(zarroBranch)
      .toEqual("master");
  });

  it(`should return undefined when there is no git repo`, async () => {
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
