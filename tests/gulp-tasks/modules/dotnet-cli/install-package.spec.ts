// noinspection ES6ConvertRequireIntoImport

import "expect-even-more-jest";
import { faker } from "@faker-js/faker";

const {
  mockSystem,
  fetchHistory
} = require("./common");

describe(`dotnet-cli:installPackage`, () => {
  const { installPackage } = requireModule<DotNetCli>("dotnet-cli");
  beforeEach(() => {
    mockSystem();
  });
  it(`should be a function`, async () => {
    // Arrange
    // Act
    expect(installPackage)
      .toBeAsyncFunction();
    // Assert
  });

  it(`should always set target project and package name`, async () => {
    // Arrange
    const
      csproj = faker.system.filePath(); // await sandbox.writeFile("foo.csproj", ""); // should be mocked, should be ok
    // Act
    await installPackage({
      projectFile: csproj,
      id: "NExpect"
    })
    // Assert
    const calls = fetchHistory();
    expect(calls[0].exe)
      .toEqual("dotnet");
    expect(calls[0].args)
      .toEqual([ "add", csproj, "package", "NExpect" ]);
  });

  it(`should specify version when set`, async () => {
    // Arrange
    const
      id = "NExpect",
      version = faker.system.semver(),
      projectFile = faker.system.filePath();
    // Act
    await installPackage({
      id,
      version,
      projectFile
    });
    // Assert
    const calls = fetchHistory();
    expect(calls[0].args)
      .toEqual([
        "add", projectFile, "package",
        id,
        "--version",
        version
      ]);
  });

  it(`should specify framework when set`, async () => {
    // Arrange
    const
      id = "NExpect",
      framework = faker.string.alphanumeric(12),
      projectFile = faker.system.filePath();
    // Act
    await installPackage({
      id,
      framework,
      projectFile
    });
    // Assert
    const calls = fetchHistory();
    expect(calls[0].args)
      .toEqual([
        "add", projectFile, "package",
        id,
        "--framework",
        framework
      ]);
  });

  it(`should not restore when disabled`, async () => {
    // Arrange
    const
      id = "NExpect",
      projectFile = faker.system.filePath();
    // Act
    await installPackage({
      id,
      projectFile,
      noRestore: true
    });
    // Assert
    const calls = fetchHistory();
    expect(calls[0].args)
      .toEqual([
        "add", projectFile, "package",
        id,
        "--no-restore"
      ]);
  });

  it(`should specify the source when required`, async () => {
    // Arrange
    const
      id = "NExpect",
      source = faker.string.alphanumeric(12),
      projectFile = faker.system.filePath();
    // Act
    await installPackage({
      id,
      source,
      projectFile
    });
    // Assert
    const calls = fetchHistory();
    expect(calls[0].args)
      .toEqual([
        "add", projectFile, "package",
        id,
        "--source",
        source
      ]);
  });

  it(`should specify the package directory when required`, async () => {
    // Arrange
    const
      id = "NExpect",
      packageDirectory = faker.string.alphanumeric(12),
      projectFile = faker.system.filePath();
    // Act
    await installPackage({
      id,
      packageDirectory,
      projectFile
    });
    // Assert
    const calls = fetchHistory();
    expect(calls[0].args)
      .toEqual([
        "add", projectFile, "package",
        id,
        "--package-directory",
        packageDirectory
      ]);
  });

  it(`should specify pre-release when required`, async () => {
    // Arrange
    const
      id = "NExpect",
      projectFile = faker.system.filePath();
    // Act
    await installPackage({
      id,
      projectFile,
      preRelease: true
    });
    // Assert
    const calls = fetchHistory();
    expect(calls[0].args)
      .toEqual([
        "add", projectFile, "package",
        id,
        "--prerelease"
      ]);
  });
});
