import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
const resolveGitBranch = requireModule<ResolveGitBranch>("resolve-git-branch");

describe(`resolve-git-branch`, () => {
  it(`should export a function`, async () => {
    // Arrange
    // Act
    expect(resolveGitBranch)
      .toBeFunction();
    // Assert
  });

  it(`should return the remote when there is one`, async () => {
    // Arrange
    // Act
    const zarroBranch = await resolveGitBranch();
    // Assert
    expect(zarroBranch)
      .toEqual("master");
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
