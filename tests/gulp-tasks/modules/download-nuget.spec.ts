import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import * as path from "path";
import { fileExists } from "yafs";
import { ZarroLogger } from "../../../types";

describe(`download-nuget`, () => {
  const downloadNuget = require("../../../gulp-tasks/modules/download-nuget");
  const logger = require("../../../gulp-tasks/modules/log") as ZarroLogger;
  it(`should be a function`, async () => {
    // Arrange
    // Act
    expect(downloadNuget)
      .toBeFunction();
    // Assert
  });

  // this is an integration test, to prove that the download works
  // -> it's dependent on nuget.org and a working network
  it.skip(`should download nuget.exe to the target folder (integration)`, async () => {
    // Arrange
    logger.setThreshold(logger.LogLevels.Debug);
    const
      sandbox = await Sandbox.create(),
      expected = path.join(sandbox.path, "nuget.exe");
    // Act
    await downloadNuget(sandbox.path);
    // Assert
    expect(await fileExists(expected))
      .toBeTrue();
  }, 15000);

  afterEach(async () => {
    await Sandbox.destroyAll();
  });
});
