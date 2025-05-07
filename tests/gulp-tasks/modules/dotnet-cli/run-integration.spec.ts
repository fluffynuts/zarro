import "expect-even-more-jest";
import { Sandbox } from "filesystem-sandbox";
import { ls, FsEntities, readTextFile, writeTextFile } from "yafs";
import { faker } from "@faker-js/faker";

const
  realSystem = requireModule<System>("system"),
  {
    run,
    create
  } = requireModule<DotNetCli>("dotnet-cli");

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
        throw new Error(`Can't find hello-world project in ${ sandbox.path }`);
      }
      const program = allFiles.find(s => s.match(/program.cs$/i));
      if (!program) {
        throw new Error(`Can't find project.cs in ${ sandbox.path }`);
      }
      const
        original = await readTextFile(program),
        updated = `
 ${original}
 foreach (var arg in args)
 {
     Console.WriteLine(arg);
 }
 `;
      await writeTextFile(program, updated);
      const args = [ faker.string.alphanumeric() ];

      // Act
      const result = await run({
        target,
        args
      });
      // Assert
      expect(realSystem.isError(result))
        .toBeFalse();
      expect(result.stdout[0])
        .toEqual("Hello, World!");
      expect(result.stdout[1])
        .toEqual(args[0]);
    });
  });
});
