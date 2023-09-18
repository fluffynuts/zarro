import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import * as path from "path";
import { fileExists } from "yafs";

describe(`download-nuget`, () => {
  const downloadNuget = requireModule<DownloadNuget>("download-nuget");
  const logger = requireModule<Log>("log");
  it(`should be a function`, async () => {
    // Arrange
    // Act
    expect(downloadNuget)
      .toBeFunction();
    // Assert
  });

  // this is an integration test, to prove that the download works
  // -> it's dependent on nuget.org and a working network
  it(`should download nuget.exe to the target folder without feedback`, async () => {
    // Arrange
    let progressCalls = 0;
    spyOn(console, "log").and.callFake((...args: any[]) => {
      if (`${args[0]}`.includes(" of ")) {
        progressCalls++;
      }
    });
    spyOn(process.stdout, "write").and.callFake((...args: any[]) => {
      if (`${args[0]}`.includes(" of ")) {
        progressCalls++;
      }
    });
    logger.setThreshold(logger.LogLevels.Info);
    const
      sandbox = await Sandbox.create(),
      expected = path.join(sandbox.path, "nuget.exe");
    // Act
    await downloadNuget(sandbox.path, true);
    // Assert
    expect(await fileExists(expected))
      .toBeTrue();
    expect(progressCalls)
        .toEqual(0);
  });

  afterEach(async () => {
    await Sandbox.destroyAll();
  });
});
