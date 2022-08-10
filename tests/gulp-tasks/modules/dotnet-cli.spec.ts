import "expect-even-more-jest";
import { faker } from "@faker-js/faker";

describe("dotnet-cli", () => {
  const
    spawn = jest.fn(),
    requireModuleActual = require("../../../gulp-tasks/modules/require-module");
  requireModuleActual.mock("spawn", spawn);

  const sut = requireModule<DotNetCli>("dotnet-cli");

  describe(`test`, () => {
    const { test } = sut;
    it(`should be a function`, async () => {
      // Arrange
      // Act
      expect(test)
        .toBeFunction();
      // Assert
    });

    it(`should invoke dotnet test on provided solution / project`, async () => {
      // Arrange
      const expected = faker.random.word();
      // Act
      await test({
        target: expected
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", ["test", expected],
          expect.any(Object)
        )
    });

    [
      "m", "minimal",
      "q", "quiet",
      "n", "normal",
      "d", "detailed",
      "diag", "diagnostic"
    ].forEach(verbosity => {
      it(`should use the provided verbosity`, async () => {
        // Arrange
        const
          target = faker.random.word();
        // Act
        await test({
          target,
          verbosity: verbosity as DotNetVerbosity
        });
        // Assert
        expect(spawn)
          .toHaveBeenCalledOnceWith(
            "dotnet", ["test", target, "-v", verbosity],
            expect.any(Object)
          );
      });
    });
    it(`should use the provided configuration`, async () => {
      // Arrange
      const
        target = faker.random.word(),
        configuration = faker.random.word();
      // Act
      await test({
        target,
        configuration
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", ["test", target, "-c", configuration],
          expect.any(Object)
        )
    });

    it(`should set --no-build on request`, async () => {
      // Arrange
      const
        target = faker.random.word();
      // Act
      await test({
        target,
        noBuild: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", ["test", target, "--no-build"],
          expect.any(Object)
        )
    });

    it(`should set --no-restore on request`, async () => {
      // Arrange
      const
        target = faker.random.word();
      // Act
      await test({
        target,
        noRestore: true
      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", ["test", target, "--no-restore"],
          expect.any(Object)
        )
    });

    it(`should set a single logger`, async () => {
      // Arrange
      const
        target = faker.random.word();
      // Act
      await test({
        target,
        loggers: {
          "console": {
            verbosity: "normal",
            foo: "bar"
          }
        }

      });
      // Assert
      expect(spawn)
        .toHaveBeenCalledOnceWith(
          "dotnet", ["test", target, "--logger", "console;verbosity=normal;foo=bar"],
          expect.any(Object)
        )
    });

  });

});
