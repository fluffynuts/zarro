import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import * as path from "path";
import { FsEntities, ls } from "yafs";
import { withLockedNuget } from "../../test-helpers/run-locked";
import { shouldSkipSlowNetworkTests } from "../../test-helpers/should-skip-slow-network-tests";
import { spyOnConsole } from "../../test-helpers/spy-on-console";

if (shouldSkipSlowNetworkTests()) {
  describe(`find-local-nuget`, () => {
    it(`skipping tests`, async () => {
      // Arrange
      // Act
      expect(true).toBeTrue();
      // Assert
    });
  });
} else {
  describe(`find-local-nuget`, () => {
    const findLocalNuget = requireModule<FindLocalNuget>("find-local-nuget");

    const
      os = require("os"),
      isWindows = os.platform() === "win32";

    beforeAll(() => {
      process.env.SUPPRESS_DOWNLOAD_PROGRESS = "1";
    });

    it(`should download nuget.exe to the build tools folder`, async () => {
      await withLockedNuget(async () => {
        // Arrange
        spyOn(console, "log");
        spyOn(console, "error");
        const
          sandbox = await Sandbox.create();
        process.env.BUILD_TOOLS_FOLDER = sandbox.path;
        // Act
        const result = await findLocalNuget();
        // Assert
        const expectedExecutable = isWindows
          ? "nuget.exe"
          : "nuget";
        expect(result.toLowerCase())
          .toEqual(path.join(sandbox.path, expectedExecutable).toLowerCase());
        const contents = await ls(
          sandbox.path, {
            entities: FsEntities.files,
            recurse: false,
            fullPaths: false
          });
        expect(contents)
          .toContain("nuget.exe");
      });
    });

    it(`should be able to install nuget package in dir via resolved nuget path`, async () => {
      await withLockedNuget(async () => {
        spyOnConsole();
        const system = requireModule<System>("system");
        // Arrange
        spyOn(console, "log");
        spyOn(console, "error");
        const
          sandbox = await Sandbox.create(),
          toolsFolder = await sandbox.mkdir("build-tools");
        process.env.BUILD_TOOLS_FOLDER = toolsFolder;
        // Act
        const nuget = await findLocalNuget();
        await sandbox.run(async () => {
          await system(nuget, [ "install", "PeanutButter.TempDb.Runner" ])
        });
        // Assert
        const dirs = await ls(sandbox.path, { entities: FsEntities.folders });
        expect(dirs.find(o => o.indexOf("PeanutButter.TempDb.Runner") > -1))
          .not.toBeUndefined();
      });
    });

    afterAll(async () => {
      try {
        await Sandbox.destroyAll();
      } catch (e) {
        // suppress
      }
    });
  });
}
