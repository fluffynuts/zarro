import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";

const resolveGitRemote = requireModule<ResolveGitRemote>("resolve-git-remote");
describe(`resolve-git-remote`, () => {
  it(`should export a function`, async () => {
    // Arrange
    // Act
    expect(resolveGitRemote)
      .toBeFunction();
    // Assert
  });

  it(`should return the remote when there is one`, async () => {
    // Arrange
    // Act
    const zarroRemote = await resolveGitRemote();
    // Assert
    expect(zarroRemote)
      .toEqual("origin");
  });

  it(`should return undefined when there is no remote`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create();
    // Act
    const result = await resolveGitRemote(sandbox.path.toString());
    // Assert
    expect(result)
      .toBeUndefined();
  });

  afterAll(async () => {
    await Sandbox.destroyAll();
  });
});
