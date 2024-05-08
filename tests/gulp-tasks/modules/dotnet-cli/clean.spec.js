"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
const filesystem_sandbox_1 = require("filesystem-sandbox");
const { anything, system, disableSystemCallThrough, mockSystem, mockUpdatePackageNuspec, } = require("./common");
describe(`dotnet-cli:clean`, () => {
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
    const { clean } = sut;
    it(`should be a function`, async () => {
        // Arrange
        // Act
        // Assert
        expect(clean)
            .toBeAsyncFunction();
    });
    it(`should use the provided framework`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample(), framework = faker_1.faker.word.sample();
        // Act
        await clean({
            target,
            framework
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["clean", target, "--framework", framework], anything);
    });
    it(`should use the provided runtime`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample(), runtime = faker_1.faker.word.sample();
        // Act
        await clean({
            target,
            runtime
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["clean", target, "--runtime", runtime], anything);
    });
    it(`should use the provided configuration`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample(), configuration = faker_1.faker.word.sample();
        // Act
        await clean({
            target,
            configuration
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["clean", target, "--configuration", configuration], anything);
    });
    it(`should use the provided configurations`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample(), configuration1 = faker_1.faker.word.sample(), configuration2 = faker_1.faker.word.sample();
        // Act
        await clean({
            target,
            configuration: [configuration1, configuration2]
        });
        // Assert
        expect(system)
            .toHaveBeenCalledTimes(2);
        expect(system)
            .toHaveBeenCalledWith("dotnet", ["clean", target, "--configuration", configuration1], anything);
        expect(system)
            .toHaveBeenCalledWith("dotnet", ["clean", target, "--configuration", configuration2], anything);
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
            await clean({
                target,
                verbosity: verbosity
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["clean", target, "--verbosity", verbosity], anything);
        });
    });
    // shouldn't ever have to do this - dotnet clean should be
    // looking at the csproj, surely?
    it(`should use the provided output`, async () => {
        // Arrange
        const target = faker_1.faker.word.sample(), output = faker_1.faker.word.sample();
        // Act
        await clean({
            target,
            output
        });
        // Assert
        expect(system)
            .toHaveBeenCalledOnceWith("dotnet", ["clean", target, "--output", output], anything);
    });
});
