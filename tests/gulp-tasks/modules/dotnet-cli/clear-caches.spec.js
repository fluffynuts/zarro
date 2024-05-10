"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
describe(`dotnet-cli:clearCaches`, () => {
    const { system, disableSystemCallThrough, mockSystem, anything } = require("./common");
    const { clearCaches } = requireModule("dotnet-cli");
    [
        clearCaches.httpCache,
        clearCaches.temp
    ].forEach(cacheType => {
        it(`should be able to clear cache: ${cacheType}`, async () => {
            // Arrange
            mockSystem();
            disableSystemCallThrough();
            spyOn(console, "log");
            // Act
            await clearCaches(cacheType);
            // Assert
            expect(system)
                .toHaveBeenCalledOnceWith("dotnet", ["nuget", "locals", `${cacheType}`, "--clear"], anything);
        });
    });
});
