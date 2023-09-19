"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
describe(`requireModule`, () => {
    it(`should load the module from gulp-tasks/modules`, async () => {
        // Arrange
        // Act
        const dotNetCli = requireModule("dotnet-cli");
        // Assert
        expect(dotNetCli)
            .toExist();
        expect(dotNetCli.addNugetSource)
            .toBeFunction();
        expect(dotNetCli.removeNugetSource)
            .toBeFunction();
        expect(dotNetCli.pack)
            .toBeFunction();
    });
    ["dotnetcli", "dot-net-cli", "DotNet_Cli"].forEach(mod => {
        it(`should fuzzy-find module: ${mod}`, async () => {
            // Arrange
            spyOn(console, "warn");
            let result;
            // Act
            expect(() => result = requireModule(mod))
                .not.toThrow();
            // Assert
            expect(result)
                .toBeDefined();
            expect(result === null || result === void 0 ? void 0 : result.pack)
                .toBeFunction();
            expect(console.warn)
                .toHaveBeenCalledWith(expect.stringContaining("closest match 'dotnet-cli'"));
        });
    });
    const os = require("os"), isWindows = os.platform() === "win32";
    if (!isWindows) {
        // on windows, case-sensitivity won't matter at all, ofc
        it(`should find the module with invalid casing on a Good Operating System (1)`, async () => {
            // Arrange
            spyOn(console, "warn");
            let result;
            // Act
            expect(() => result = requireModule("DotNet-Cli"))
                .not.toThrow();
            // Assert
            expect(result)
                .toBeDefined();
            expect(result === null || result === void 0 ? void 0 : result.pack)
                .toBeFunction();
            expect(console.warn)
                .toHaveBeenCalledWith(expect.stringContaining("closest match 'dotnet-cli'"));
        });
        it(`should find the module with invalid casing on a Good Operating System (2)`, async () => {
            // Arrange
            spyOn(console, "warn");
            let result;
            // Act
            expect(() => result = requireModule("System"))
                .not.toThrow();
            // Assert
            expect(result)
                .toBeDefined();
            expect(result)
                .toBeFunction();
            expect(console.warn)
                .toHaveBeenCalledWith(expect.stringContaining("closest match 'system'"));
        });
    }
});
