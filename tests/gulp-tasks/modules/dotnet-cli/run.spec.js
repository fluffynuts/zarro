"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const faker_1 = require("@faker-js/faker");
const { anything, system, disableSystemCallThrough, mockSystem, mockUpdatePackageNuspec, } = require("./common"), { run } = requireModule("dotnet-cli");
describe(`dotnet-cli:run`, () => {
    describe(`unit testing`, () => {
        beforeEach(() => {
            mockSystem();
            mockUpdatePackageNuspec();
            disableSystemCallThrough();
            spyOn(console, "log");
        });
        it(`should be an async function`, async () => {
            // Arrange
            // Act
            expect(run)
                .toBeAsyncFunction();
            // Assert
        });
        it(`should run the project`, async () => {
            // Arrange
            const target = faker_1.faker.system.fileName();
            // Act
            await run({
                target
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target], anything);
        });
        it(`should use the provided configuration`, async () => {
            // Arrange
            const configuration = faker_1.faker.string.alphanumeric(), target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                configuration
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--configuration", configuration], anything);
        });
        it(`should use provided framework`, async () => {
            // Arrange
            const framework = faker_1.faker.string.alphanumeric(), target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                framework
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--framework", framework], anything);
        });
        it(`should use provided runtime`, async () => {
            // Arrange
            const runtime = faker_1.faker.string.alphanumeric(), target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                runtime
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--runtime", runtime], anything);
        });
        it(`should use the provided launch profile`, async () => {
            // Arrange
            const launchProfile = faker_1.faker.string.alphanumeric(), target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                launchProfile
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--launch-profile", launchProfile], anything);
        });
        it(`should disable launch profiles on demand`, async () => {
            // Arrange
            const target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                noLaunchProfile: true
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--no-launch-profile"], anything);
        });
        it(`should disable build on demand`, async () => {
            // Arrange
            const target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                noBuild: true
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--no-build"], anything);
        });
        it(`should enable interactivity on demand`, async () => {
            // Arrange
            const target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                interactive: true
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--interactive"], anything);
        });
        it(`should disable restore on demand`, async () => {
            // Arrange
            const target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                noRestore: true
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--no-restore"], anything);
        });
        it(`should disable self-contained on demand`, async () => {
            // Arrange
            const target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                noSelfContained: true
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--no-self-contained"], anything);
        });
        it(`should enable self-contained on demand`, async () => {
            // Arrange
            const target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                selfContained: true
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--self-contained"], anything);
        });
        it(`should use the provided launch os`, async () => {
            // Arrange
            const os = faker_1.faker.string.alphanumeric(), target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                os
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--os", os], anything);
        });
        it(`should disable build servers on demand`, async () => {
            // Arrange
            const target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                disableBuildServers: true
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--disable-build-servers"], anything);
        });
        it(`should use the provided artifacts path`, async () => {
            // Arrange
            const artifactsPath = faker_1.faker.string.alphanumeric(), target = faker_1.faker.system.fileName();
            // Act
            await run({
                target,
                artifactsPath
            });
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["run", "--project", target, "--artifacts-path", artifactsPath], anything);
        });
    });
});
