import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { ls } from "yafs";

describe(`fetch-github-release`, function() {
  const {
    fetchLatestRelease
  } = requireModule<FetchGithubRelease>("fetch-github-release");
  it(`should export fetchLatestRelease function`, async () => {
    // Arrange
    // Act
    expect(fetchLatestRelease)
      .toBeFunction();
    // Assert
  });

  it(`should fetch a release`, async () => {
    // Arrange
    const
      sandbox = await Sandbox.create();
    // Act
    await fetchLatestRelease({
      owner: "axllent",
      repo: "mailpit",
      destination: sandbox.path
    });
    // Assert
    const
      contents = await ls(sandbox.path),
      lowercased = contents.map(s => s.toLowerCase());

    const mailpit = lowercased.find(o => o === "mailpit") ||
      lowercased.find(o => o === "mailpit.exe");
    expect(mailpit)
      .toBeDefined();
  });
});
