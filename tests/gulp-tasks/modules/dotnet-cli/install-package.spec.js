"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
const { mockSystem, fetchHistory } = require("./common");
describe(`installPackage`, () => {
    const { installPackage } = requireModule("dotnet-cli");
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
        const csproj = faker_1.faker.system.filePath(); // await sandbox.writeFile("foo.csproj", ""); // should be mocked, should be ok
        // Act
        await installPackage({
            projectFile: csproj,
            id: "NExpect"
        });
        // Assert
        const calls = fetchHistory();
        expect(calls[0].exe)
            .toEqual("dotnet");
        expect(calls[0].args)
            .toEqual(["add", "package", csproj, "NExpect"]);
    });
    it(`should specify version when set`, async () => {
        // Arrange
        const id = "NExpect", version = faker_1.faker.system.semver(), projectFile = faker_1.faker.system.filePath();
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
            "add", "package",
            projectFile,
            id,
            "--version",
            version
        ]);
    });
    it(`should specify framework when set`, async () => {
        // Arrange
        const id = "NExpect", framework = faker_1.faker.string.alphanumeric(12), projectFile = faker_1.faker.system.filePath();
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
            "add", "package",
            projectFile,
            id,
            "--framework",
            framework
        ]);
    });
    it(`should not restore when disabled`, async () => {
        // Arrange
        const id = "NExpect", projectFile = faker_1.faker.system.filePath();
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
            "add", "package",
            projectFile,
            id,
            "--no-restore"
        ]);
    });
    it(`should specify the source when required`, async () => {
        // Arrange
        const id = "NExpect", source = faker_1.faker.string.alphanumeric(12), projectFile = faker_1.faker.system.filePath();
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
            "add", "package",
            projectFile,
            id,
            "--source",
            source
        ]);
    });
    it(`should specify the package directory when required`, async () => {
        // Arrange
        const id = "NExpect", packageDirectory = faker_1.faker.string.alphanumeric(12), projectFile = faker_1.faker.system.filePath();
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
            "add", "package",
            projectFile,
            id,
            "--package-directory",
            packageDirectory
        ]);
    });
    it(`should specify pre-release when required`, async () => {
        // Arrange
        const id = "NExpect", projectFile = faker_1.faker.system.filePath();
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
            "add", "package",
            projectFile,
            id,
            "--prerelease"
        ]);
    });
});
