"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const { anything, system, disableSystemCallThrough, mockSystem, mockUpdatePackageNuspec, } = require("./common");
describe(`build`, () => {
    beforeEach(() => {
        mockSystem();
        mockUpdatePackageNuspec();
        disableSystemCallThrough();
        spyOn(console, "log");
    });
    afterEach(async () => {
        await filesystem_sandbox_1.Sandbox.destroyAll();
    });
    const sut = requireModule("dotnet-cli");
    const { build } = sut;
    it(`should be a function`, async () => {
        // Arrange
        // Act
        expect(build)
            .toBeAsyncFunction();
        // Assert
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
            const target = faker_1.faker.word.sample();
            // Act
            await build({
                target,
                verbosity: verbosity
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--verbosity", verbosity], anything);
        });
    });
    it(`should use the provided configuration`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample(), configuration = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            configuration: configuration
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--configuration", configuration], anything);
    });
    it(`should use the provided framework`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample(), framework = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            framework
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--framework", framework], anything);
    });
    it(`should use the provided runtime`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample(), runtime = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            runtime
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--runtime", runtime], anything);
    });
    it(`should use the provided architecture`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample(), arch = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            arch
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--arch", arch], anything);
    });
    it(`should use the provided os`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample(), os = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            os
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--os", os], anything);
    });
    it(`should use the provided version suffix`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample(), versionSuffix = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            versionSuffix
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--version-suffix", versionSuffix], anything);
    });
    it(`should be able to skip package restore`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            noRestore: true
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--no-restore"], anything);
    });
    it(`should be able to skip dependencies`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            noDependencies: true
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--no-dependencies"], anything);
    });
    it(`should be able to skip incremental building`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            noIncremental: true
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--no-incremental"], anything);
    });
    it(`should be able to force disable build servers`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            disableBuildServers: true
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--disable-build-servers"], anything);
    });
    it(`should be able to build self-contained`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            selfContained: true
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--self-contained"], anything);
    });
    it(`should disable build servers on request`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            disableBuildServers: true
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "--disable-build-servers"], anything);
    });
    it(`should add msbuildProperties, when present`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            msbuildProperties: {
                foo: "bar",
                quux: "wibbles and toast",
                "spaced arg": "more spaces"
            }
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "-p:foo=bar", `-p:quux="wibbles and toast"`, `-p:"spaced arg"="more spaces"`], anything);
    });
    it(`should add additionalArguments, when set`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample();
        // Act
        await build({
            target,
            additionalArguments: ["foo", "bar", "quux"]
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["build", target, "foo", "bar", "quux"], anything);
    });
});
