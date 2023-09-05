import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import * as path from "path";
import { FsEntities, ls } from "yafs";

describe(`find-local-nuget`, () => {
  const findLocalNuget = requireModule<FindLocalNuget>("find-local-nuget");

  const
    os = require("os"),
    isWindows = os.platform() === "win32";

  it(`should download nuget.exe to the build tools folder`, async () => {
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

  afterEach(async () => {
    await Sandbox.destroyAll();
  });
});
