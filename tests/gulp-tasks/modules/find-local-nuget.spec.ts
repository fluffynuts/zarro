import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import * as path from "path";
import { FsEntities, ls } from "yafs";
import { withLockedNuget } from "../../test-helpers/run-locked";

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
        await system(nuget, [ "install", "NExpect", "-source", "nuget.org" ])
      });
      // Assert
      const dirs = await ls(sandbox.path, { entities: FsEntities.folders });
      expect(dirs.find(o => o.indexOf("NExpect") > -1))
        .not.toBeUndefined();
    });
  });

  afterAll(async () => {
    await Sandbox.destroyAll();
  });
});
