import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { ls } from "yafs";

describe(`fetch-github-release`, function() {
  // this test calls the live GitHub API. tests/setup.js already retries every test 3 times,
  // but back to back: a network blip outlasted all four attempts (inside 42s) in CI.
  // so space the retries out. Same IDE guard as tests/setup.js.
  if (!process.env.RUNNING_FROM_IDE && !process.env.JB_IDE_PORT) {
    jest.retryTimes(3, { logErrorsBeforeRetry: true, waitBeforeRetry: 15000 });
  }

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
      destination: sandbox.path,
      // unauthenticated requests share a low rate limit on CI runners
      accessToken: process.env.GITHUB_TOKEN
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
