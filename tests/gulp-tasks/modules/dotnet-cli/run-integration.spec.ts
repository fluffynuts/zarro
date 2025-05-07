import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { ls, FsEntities } from "yafs";

const
  realSystem = requireModule<System>("system"),
  { run, create } = requireModule<DotNetCli>("dotnet-cli");

describe(`dotnet-cli:run`, () => {
  describe(`integration testing`, () => {
    afterEach(() => {
      jest.resetAllMocks();
      Sandbox.destroyAll();
    });
    it(`should run the project`, async () => {
      // Arrange
      const
        sandbox = await Sandbox.create();

      await create({
        cwd: sandbox.path,
        name: "hello-world",
        template: "console"
      });
      const allFiles = await ls(
        sandbox.path, {
          recurse: true,
          entities: FsEntities.files,
          fullPaths: true
        }
      );
      const target = allFiles.find(s => s.match(/\.csproj$/));
      if (!target) {
        throw new Error(`Can't find hello-world project in ${sandbox.path}`);
      }
      // Act
      const result = await run({
        target
      });
      // Assert
      expect(realSystem.isError(result))
        .toBeFalse();
      expect(result.stdout[0])
        .toEqual("Hello, World!");
    });
  });
});
