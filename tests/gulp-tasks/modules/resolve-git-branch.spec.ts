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

  it(`should return the branch when there is one`, async () => {
    // Arrange
    const sysresult = await system(
      "git", [ "rev-parse", "--abbrev-ref", "HEAD" ], {
        suppressOutput: true
      }
    );
    const expected = sysresult.stdout[0];
    expect(expected)
      .toExist();
    expect(expected)
      .not.toBeEmptyString();
    // Act
    const zarroBranch = await resolveGitBranch();
    // Assert
    expect(zarroBranch)
      .toEqual(expected);
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
