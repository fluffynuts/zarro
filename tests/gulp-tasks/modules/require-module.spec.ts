import "expect-even-more-jest";
import { spyOnConsole } from "../../test-helpers/spy-on-console";

describe(`requireModule`, () => {
  it(`should load the module from gulp-tasks/modules`, async () => {
    // Arrange
    spyOnConsole();
    console.warn("foo");
    expect(console.warn)
      .toHaveBeenCalledOnceWith(
        expect.stringContaining("foo")
      );
    // Act
    const dotNetCli = requireModule<DotNetCli>("dotnet-cli");
    // Assert
    expect(dotNetCli)
      .toExist();
    expect(dotNetCli.addNugetSource)
      .toBeFunction();
    expect(dotNetCli.removeNugetSource)
      .toBeFunction();
    expect(dotNetCli.pack)
      .toBeFunction();
    expect(console.warn)
      .toHaveBeenCalledOnceWith(
        expect.stringContaining(
          "deprecated"
        )
      );
  });
  [ "dotnetcli", "dot-net-cli", "DotNet_Cli" ].forEach(
    mod => {
      it(`should fuzzy-find module: ${mod}`, async () => {
        // Arrange
        spyOnConsole();
        let result: Optional<DotNetCli>;
        // Act
        expect(() => result = requireModule<DotNetCli>(mod))
          .not.toThrow();
        // Assert
        expect(result)
          .toBeDefined();
        expect(result?.pack)
          .toBeFunction();
        expect(console.warn)
          .toHaveBeenCalledWith(
            expect.stringContaining("closest match 'dotnet-cli'")
          );
      });
    });

  const
    os = require("os"),
    isWindows = os.platform() === "win32";
  if (!isWindows) {
    // on windows, case-sensitivity won't matter at all, ofc
    it(`should find the module with invalid casing on a Good Operating System (1)`, async () => {
      // Arrange
      spyOnConsole();
      let result: Optional<DotNetCli>;
      // Act
      expect(() => result = requireModule<DotNetCli>("DotNet-Cli"))
        .not.toThrow();
      // Assert
      expect(result)
        .toBeDefined();
      expect(result?.pack)
        .toBeFunction();
      expect(console.warn)
        .toHaveBeenCalledWith(
          expect.stringContaining("closest match 'dotnet-cli'")
        );
    });

    it(`should find the module with invalid casing on a Good Operating System (2)`, async () => {
      // Arrange
      spyOnConsole();
      let result: Optional<System>;
      // Act
      expect(() => result = requireModule<System>("System"))
        .not.toThrow();
      // Assert
      expect(result)
        .toBeDefined();
      expect(result)
        .toBeFunction();
      expect(console.warn)
        .toHaveBeenCalledWith(
          expect.stringContaining("closest match 'system'")
        );
    });
  }
});
