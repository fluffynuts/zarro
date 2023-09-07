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
});
