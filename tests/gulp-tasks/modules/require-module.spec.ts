import "expect-even-more-jest";

describe(`requireModule`, () => {
    it(`should load the module from gulp-tasks/modules`, async () => {
        // Arrange
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
    });

});
